import 'dotenv/config';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as dayjs from 'dayjs';
import * as crypto from 'crypto';
import { env } from '@usefultools/utils';

import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { IAuthService } from './interface';
import { TAuth, TTokens } from './type';
import { SendEmailDto } from '../mail/dto/send-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDTO } from './dto/signup.dto';
import { AuthSignInDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import buildEmailTemplate from 'src/common/util/build-email-template';
import { emailTemplateForgotPassword } from 'src/common/template/forgot-password';
import { ERROR_MESSAGES, EXIST_ERROR, NOT_FOUND_ERROR, SERVICE_NAME } from 'src/common/messages';
import { TOKEN_TYPE } from './constants';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    private mailService: MailService,
  ) {}

  async signup(dto: SignupDTO): Promise<TAuth> {
    try {
      const oldUser = await this.userRepository.findOne({
        where: {
          email: dto.email,
        },
      });

      if (oldUser) {
        throw new BadRequestException(EXIST_ERROR.EMAIL_EXIST);
      }

      const user = await this.userRepository.create({
        email: dto.email,
        username: dto.email,
        password: dto.password,
      });

      const newUser = await this.userRepository.save(user);

      const tokens: TTokens = await this.generateTokens(newUser.id, newUser.email);

      delete newUser.password;

      await this.updateRefreshTokenHash(newUser.id, tokens.refreshToken);

      return { user, tokens };
    } catch (error) {
      throw error;
    }
  }

  async signIn(dto: AuthSignInDto): Promise<TAuth> {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user || !(await argon2.verify(user.password, dto.password))) {
      throw new NotFoundException(ERROR_MESSAGES.INCORRECT_ACCOUNT);
    }

    const tokens: TTokens = await this.generateTokens(user.id, user.email);

    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    delete user.password;

    return {
      user,
      tokens,
    };
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string): Promise<void> {
    const hashToken = await argon2.hash(refreshToken);

    await this.userRepository.update(userId, {
      hashedRT: hashToken,
    });
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<TAuth> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(NOT_FOUND_ERROR.USER);
    }

    const verifyToken = await this.jwtService.verifyAsync(refreshToken, {
      secret: env.getAsStr('JWT_REFRESH_TOKEN_SECRET_KEY'),
    });

    if (!verifyToken) {
      throw new ForbiddenException(ERROR_MESSAGES.ACCESS_DENIED);
    }

    const tokens = await this.generateTokens(user.id, user.email);

    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  async generateTokens(userId: string, email: string): Promise<TTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: env.getAsStr('JWT_ACCESS_TOKEN_SECRET_KEY'),
          expiresIn: parseInt(env.getAsStr('ACCESS_TOKEN_LIFE_TIME')) * 60,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: env.getAsStr('JWT_REFRESH_TOKEN_SECRET_KEY'),
          expiresIn: parseInt(env.getAsStr('REFRESH_TOKEN_LIFE_TIME')) * 24 * 60 * 60,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      hashedRT: null,
    });
  }

  async verifyToken(accessToken: string, tokenType: TOKEN_TYPE) {
    const tokenSecret =
      tokenType === TOKEN_TYPE.ACCESS_TOKEN
        ? env.getAsStr('JWT_ACCESS_TOKEN_SECRET_KEY')
        : env.getAsStr('JWT_REFRESH_TOKEN_SECRET_KEY');

    const verifyToken = await this.jwtService.verifyAsync(accessToken, {
      secret: tokenSecret,
    });

    if (!verifyToken) {
      throw new ForbiddenException(ERROR_MESSAGES.ACCESS_DENIED);
    }

    return verifyToken;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const oldUser = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!oldUser) {
      throw new NotFoundException(NOT_FOUND_ERROR.USER);
    }

    const digitToken = crypto.randomBytes(64).toString('hex');

    const templateString = buildEmailTemplate(emailTemplateForgotPassword, {
      number: digitToken,
    });

    const data: SendEmailDto = {
      target: dto.email,
      content: templateString,
      subject: `[${SERVICE_NAME}] Forgot password`,
    };

    await this.mailService.send(data);

    const forgotPasswordExpiredAt = dayjs().add(5, 'minutes').toDate();

    await this.userRepository.update(
      { email: dto.email },
      {
        forgotPasswordExpiredAt,
        forgotPasswordToken: digitToken,
      },
    );

    return true;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { password, passwordConfirmation, token } = dto;

    if (password != passwordConfirmation) {
      throw new BadRequestException(ERROR_MESSAGES.PASSWORD_NOT_MATCH);
    }

    const user = await this.userRepository.findOne({
      where: {
        forgotPasswordToken: token,
      },
    });

    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.TOKEN_INVALID);
    }

    const currentTime = dayjs();

    if (currentTime.isAfter(user.forgotPasswordExpiredAt)) {
      throw new BadRequestException(ERROR_MESSAGES.RESET_PASSWORD_EXPIRED);
    }

    await this.userRepository.update(user.id, {
      forgotPasswordToken: null,
      password: await argon2.hash(password),
    });

    return true;
  }

  async getRoleByUserId(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(NOT_FOUND_ERROR.USER);
    }

    return user.role;
  }

  async getHashedTokenByUserId(userId: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return null;
    }

    return user.hashedRT;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(NOT_FOUND_ERROR.USER);
    }

    if (dto.newPassword != dto.passwordConfirmation) {
      throw new BadRequestException(ERROR_MESSAGES.PASSWORD_CONFIRM_NOT_MATCH);
    }

    if (!(await argon2.verify(user.password, dto.oldPassword))) {
      throw new BadRequestException(ERROR_MESSAGES.INCORRECT_CURRENT_PASSWORD);
    }

    if (await argon2.verify(user.password, dto.newPassword)) {
      throw new BadRequestException(ERROR_MESSAGES.NEW_PASSWORD_SAME_AS_CURRENT_PASSWORD);
    }

    await this.userRepository.update(user.id, {
      password: await argon2.hash(dto.newPassword),
    });

    return true;
  }
}
