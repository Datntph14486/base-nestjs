import 'dotenv/config';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { env } from '@usefultools/utils';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { UserEntity } from './modules/users/entities/user.entity';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.getAsStr('DB_HOST'),
      port: env.getAsInt('DB_PORT'),
      username: env.getAsStr('DB_USERNAME'),
      password: env.getAsStr('DB_PASSWORD'),
      database: env.getAsStr('DB_DATABASE'),
      entities: [UserEntity],
      synchronize: env.getAsStr('NODE_ENV') !== 'production',
    }),
    UsersModule,
    MailModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: 5 });
  }
}
