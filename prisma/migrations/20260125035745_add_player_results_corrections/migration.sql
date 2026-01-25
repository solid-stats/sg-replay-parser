-- CreateTable
CREATE TABLE "PlayerReplayResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "replayId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "squadPrefix" TEXT,
    "kills" INTEGER NOT NULL,
    "killsFromVehicle" INTEGER NOT NULL,
    "vehicleKills" INTEGER NOT NULL,
    "teamkills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "deathsByTeamkills" INTEGER NOT NULL,
    "isDead" BOOLEAN NOT NULL,
    "isDeadByTeamkill" BOOLEAN NOT NULL,
    "score" REAL NOT NULL,
    "weapons" TEXT NOT NULL,
    "vehicles" TEXT NOT NULL,
    "killed" TEXT NOT NULL,
    "killers" TEXT NOT NULL,
    "teamkilled" TEXT NOT NULL,
    "teamkillers" TEXT NOT NULL,
    CONSTRAINT "PlayerReplayResult_replayId_fkey" FOREIGN KEY ("replayId") REFERENCES "Replay" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerReplayResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Correction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "replayId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "correctionType" TEXT NOT NULL,
    "targetPlayerId" TEXT,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "applied" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Correction_replayId_fkey" FOREIGN KEY ("replayId") REFERENCES "Replay" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Correction_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PlayerReplayResult_playerId_idx" ON "PlayerReplayResult"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerReplayResult_replayId_playerId_key" ON "PlayerReplayResult"("replayId", "playerId");

-- CreateIndex
CREATE INDEX "Correction_replayId_playerId_idx" ON "Correction"("replayId", "playerId");

-- CreateIndex
CREATE INDEX "Correction_applied_idx" ON "Correction"("applied");
