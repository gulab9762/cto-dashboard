import { Module } from "@nestjs/common";
import { GithubModule } from "./modules/github.module";
import { KafkaModule } from "./modules/kafka.module";
import { JiraModule } from "./modules/jira.module";

@Module({
  imports: [KafkaModule, GithubModule, JiraModule],
})
export class AppModule {}
