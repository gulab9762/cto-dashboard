import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;

  app.enableCors();

  await app.listen(port, () => {
    console.log(`Integration Service running on port ${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start Integration Service", err);
  process.exit(1);
});
