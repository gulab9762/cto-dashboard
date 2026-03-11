-- CreateTable
CREATE TABLE "EngineeringEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "repo" TEXT,
    "actor" TEXT,
    "timestamp" BIGINT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngineeringEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMetric" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 1,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventProcessingStatus" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "partition" INTEGER NOT NULL,
    "offset" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventProcessingStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EngineeringEvent_eventId_key" ON "EngineeringEvent"("eventId");

-- CreateIndex
CREATE INDEX "EngineeringEvent_orgId_idx" ON "EngineeringEvent"("orgId");

-- CreateIndex
CREATE INDEX "EngineeringEvent_source_idx" ON "EngineeringEvent"("source");

-- CreateIndex
CREATE INDEX "EngineeringEvent_type_idx" ON "EngineeringEvent"("type");

-- CreateIndex
CREATE INDEX "EngineeringEvent_timestamp_idx" ON "EngineeringEvent"("timestamp");

-- CreateIndex
CREATE INDEX "EngineeringEvent_actor_idx" ON "EngineeringEvent"("actor");

-- CreateIndex
CREATE INDEX "EventMetric_orgId_idx" ON "EventMetric"("orgId");

-- CreateIndex
CREATE INDEX "EventMetric_date_idx" ON "EventMetric"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EventMetric_orgId_metricType_date_key" ON "EventMetric"("orgId", "metricType", "date");

-- CreateIndex
CREATE UNIQUE INDEX "EventProcessingStatus_topic_partition_key" ON "EventProcessingStatus"("topic", "partition");
