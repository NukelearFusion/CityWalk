-- CreateEnum
CREATE TYPE "StopCategory" AS ENUM ('SIGHTSEEING', 'FOOD', 'ENTERTAINMENT', 'NATURE');

-- AlterTable
ALTER TABLE "route_stops" ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "category" "StopCategory" NOT NULL DEFAULT 'SIGHTSEEING',
ADD COLUMN     "costPln" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visitMinutes" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "routes" ADD COLUMN     "costPln" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "saved_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "interests" TEXT[],
    "budgetPln" INTEGER NOT NULL,
    "people" INTEGER NOT NULL DEFAULT 1,
    "stopIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_plans_userId_createdAt_idx" ON "saved_plans"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "saved_plans" ADD CONSTRAINT "saved_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_plans" ADD CONSTRAINT "saved_plans_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
