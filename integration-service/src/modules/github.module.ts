import { Module } from "@nestjs/common";
import { GithubController } from "../controllers/github.controller";
import { GithubMapper } from "../services/github.mapper";
import { KafkaModule } from "./kafka.module";

@Module({
  imports: [KafkaModule],
  controllers: [GithubController],
  providers: [GithubMapper],
})
export class GithubModule {}
