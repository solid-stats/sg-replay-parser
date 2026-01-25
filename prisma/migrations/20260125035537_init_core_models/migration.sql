-- CreateTable
CREATE TABLE "Replay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "missionName" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "gameType" TEXT NOT NULL,
    "replayLink" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISCOVERED',
    "discoveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parsedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "replayId" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "isPlayer" BOOLEAN NOT NULL,
    CONSTRAINT "Entity_replayId_fkey" FOREIGN KEY ("replayId") REFERENCES "Replay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "replayId" TEXT NOT NULL,
    "frameId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    CONSTRAINT "Event_replayId_fkey" FOREIGN KEY ("replayId") REFERENCES "Replay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlayerName" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "validFrom" DATETIME NOT NULL,
    "validTo" DATETIME,
    CONSTRAINT "PlayerName_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Replay_filename_key" ON "Replay"("filename");

-- CreateIndex
CREATE INDEX "Replay_status_gameType_idx" ON "Replay"("status", "gameType");

-- CreateIndex
CREATE INDEX "Entity_replayId_entityId_idx" ON "Entity"("replayId", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_replayId_entityId_key" ON "Entity"("replayId", "entityId");

-- CreateIndex
CREATE INDEX "Event_replayId_eventType_idx" ON "Event"("replayId", "eventType");

-- CreateIndex
CREATE INDEX "PlayerName_name_validFrom_validTo_idx" ON "PlayerName"("name", "validFrom", "validTo");
