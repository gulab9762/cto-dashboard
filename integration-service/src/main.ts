import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;

  // Enable CORS for webhooks from external services
  app.enableCors({
    origin: true, // Allow all origins for webhooks
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-github-event', 'x-hub-signature-256'],
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle("CTO Dashboard - Integration Service")
    .setDescription(
      "Event ingestion service for GitHub, Jira, and other integrations"
    )
    .setVersion("1.0.0")
    .addTag(
      "github",
      "GitHub webhook endpoints for PRs, commits, and reviews"
    )
    .addTag("jira", "Jira webhook endpoints for issues and requirements")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: 1,
      persistAuthorization: true,
    },
  });

  await app.listen(port, () => {
    console.log(`✅ Integration Service running on port ${port}`);
    console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start Integration Service", err);
  process.exit(1);
});
