import { Module } from "@nestjs/common";
import { JiraController } from "../controllers/jira.controller";
import { KafkaModule } from "./kafka.module";

@Module({
  imports: [KafkaModule],
  controllers: [JiraController],
})
export class JiraModule {}
