-- CreateTable
CREATE TABLE "PlayerStatistics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "rotationId" TEXT,
    "totalPlayedGames" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "killsFromVehicle" INTEGER NOT NULL,
    "vehicleKills" INTEGER NOT NULL,
    "teamkills" INTEGER NOT NULL,
    "deathsTotal" INTEGER NOT NULL,
    "deathsByTeamkills" INTEGER NOT NULL,
    "kdRatio" REAL NOT NULL,
    "killsFromVehicleCoef" REAL NOT NULL,
    "totalScore" REAL NOT NULL,
    "lastPlayedGameDate" DATETIME NOT NULL,
    "lastSquadPrefix" TEXT,
    "isShow" BOOLEAN NOT NULL DEFAULT true,
    "needsRecalculation" BOOLEAN NOT NULL DEFAULT false,
    "lastCalculatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerStatistics_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerWeeklyStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "statisticsId" TEXT NOT NULL,
    "week" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalPlayedGames" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "killsFromVehicle" INTEGER NOT NULL,
    "vehicleKills" INTEGER NOT NULL,
    "teamkills" INTEGER NOT NULL,
    "deathsTotal" INTEGER NOT NULL,
    "deathsByTeamkills" INTEGER NOT NULL,
    "kdRatio" REAL NOT NULL,
    "killsFromVehicleCoef" REAL NOT NULL,
    "score" REAL NOT NULL,
    CONSTRAINT "PlayerWeeklyStats_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "PlayerStatistics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerWeaponStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "statisticsId" TEXT NOT NULL,
    "weaponName" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "maxDistance" REAL NOT NULL,
    CONSTRAINT "PlayerWeaponStats_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "PlayerStatistics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerVehicleStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "statisticsId" TEXT NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "maxDistance" REAL NOT NULL,
    CONSTRAINT "PlayerVehicleStats_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "PlayerStatistics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "statisticsId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetPlayerId" TEXT NOT NULL,
    "targetPlayerName" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    CONSTRAINT "PlayerInteraction_statisticsId_fkey" FOREIGN KEY ("statisticsId") REFERENCES "PlayerStatistics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SquadStatistics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prefix" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "rotationId" TEXT,
    "fourWeeksOnly" BOOLEAN NOT NULL,
    "averagePlayersCount" REAL NOT NULL,
    "kills" INTEGER NOT NULL,
    "averageKills" REAL NOT NULL,
    "teamkills" INTEGER NOT NULL,
    "averageTeamkills" REAL NOT NULL,
    "score" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "SquadPlayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "squadStatisticsId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "deathsTotal" INTEGER NOT NULL,
    "teamkills" INTEGER NOT NULL,
    "kdRatio" REAL NOT NULL,
    "totalPlayedGames" INTEGER NOT NULL,
    "totalScore" REAL NOT NULL,
    "vehicleKills" INTEGER NOT NULL,
    "killsFromVehicle" INTEGER NOT NULL,
    "killsFromVehicleCoef" REAL NOT NULL,
    CONSTRAINT "SquadPlayer_squadStatisticsId_fkey" FOREIGN KEY ("squadStatisticsId") REFERENCES "SquadStatistics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PlayerStatistics_needsRecalculation_idx" ON "PlayerStatistics"("needsRecalculation");

-- CreateIndex
CREATE INDEX "PlayerStatistics_playerId_gameType_idx" ON "PlayerStatistics"("playerId", "gameType");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStatistics_playerId_gameType_rotationId_key" ON "PlayerStatistics"("playerId", "gameType", "rotationId");

-- CreateIndex
CREATE INDEX "PlayerWeeklyStats_statisticsId_idx" ON "PlayerWeeklyStats"("statisticsId");

-- CreateIndex
CREATE INDEX "PlayerWeaponStats_statisticsId_idx" ON "PlayerWeaponStats"("statisticsId");

-- CreateIndex
CREATE INDEX "PlayerVehicleStats_statisticsId_idx" ON "PlayerVehicleStats"("statisticsId");

-- CreateIndex
CREATE INDEX "PlayerInteraction_statisticsId_type_idx" ON "PlayerInteraction"("statisticsId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "SquadStatistics_prefix_gameType_rotationId_fourWeeksOnly_key" ON "SquadStatistics"("prefix", "gameType", "rotationId", "fourWeeksOnly");

-- CreateIndex
CREATE INDEX "SquadPlayer_squadStatisticsId_idx" ON "SquadPlayer"("squadStatisticsId");
