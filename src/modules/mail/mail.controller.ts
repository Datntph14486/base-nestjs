import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { MailService } from './mail.service';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async send(@Body() dto: SendEmailDto) {
    return this.mailService.send(dto);
  }
}
