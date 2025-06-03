import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async send(dto: SendEmailDto) {
    await this.mailerService.sendMail({
      to: dto.target,
      subject: dto.subject,
      html: dto.content,
    });

    return { data: true };
  }
}
