import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SerializeInterceptor } from "@hovoh/nestjs-api-lib";
import { ApplicationErrorsFilter } from "@hovoh/nestjs-application-error";
import { errors } from "@hovoh/nestjs-authentication-lib";
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalInterceptors(new SerializeInterceptor());
  app.useGlobalFilters(
    new ApplicationErrorsFilter(errors.authErrorStatusMap),
  );
  await app.listen(3001);
}
bootstrap();
