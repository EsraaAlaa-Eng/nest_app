import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);

  
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

  await app.listen(port, () => {
    console.log(`Server is running on port ::: ${port} 🚀`);
  });
}
bootstrap();
