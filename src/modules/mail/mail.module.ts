import 'dotenv/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { env } from '@usefultools/utils';

import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: env.getAsStr('MAIL_HOST'),
          port: parseInt(env.getAsStr('MAIL_PORT'), 10),
          secure: false,
          auth: {
            user: env.getAsStr('MAIL_USER'),
            pass: env.getAsStr('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <noreply@example.com>',
        },
      }),
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
