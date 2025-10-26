import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setDefaultLanguage } from './common/middleware';
import { LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  app.use(setDefaultLanguage);
  app.useGlobalInterceptors(new LoggingInterceptor())

  // ValidationPipe Global
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     // stopAtFirstError: true,
  //     // disableErrorMessages:true,
  //     // dismissDefaultMessages:true,

  //     // skipUndefinedProperties:true,
  //     // skipNullProperties:true,
  //     // skipMissingProperties:true,

  //   })
  // )

  app.enableCors({
    origin: 'http://localhost:4200', // Angular frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(port, () => {
    console.log(`Server is running on port ::: ${port} 🚀`);
  });
}
bootstrap();
