import { TAuth, TTokens } from '../type';

import { TOKEN_TYPE } from '../constants';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthSignInDto } from '../dto/signin.dto';
import { SignupDTO } from '../dto/signup.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

export interface IAuthService {
  signup(dto: SignupDTO): Promise<TAuth>;

  signIn(dto: AuthSignInDto): Promise<TAuth>;

  updateRefreshTokenHash(userId: string, refreshToken: string): Promise<void>;

  refreshTokens(userId: string, refreshToken: string): Promise<TAuth>;

  generateTokens(userId: string, email: string): Promise<TTokens>;

  logout(userId: string): Promise<void>;

  verifyToken(accessToken: string, tokenType: TOKEN_TYPE): Promise<any>;

  forgotPassword(dto: ForgotPasswordDto): Promise<boolean>;

  resetPassword(dto: ResetPasswordDto): Promise<boolean>;

  getRoleByUserId(userId: string): Promise<string>;

  changePassword(userId: string, dto: ChangePasswordDto): Promise<boolean>;

  getHashedTokenByUserId(userId: string): Promise<string | null>;
}
