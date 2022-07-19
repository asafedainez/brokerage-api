/*
  Warnings:

  - You are about to drop the `Operations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Operations" DROP CONSTRAINT "Operations_idAsset_fkey";

-- DropForeignKey
ALTER TABLE "Operations" DROP CONSTRAINT "Operations_idUser_fkey";

-- DropTable
DROP TABLE "Operations";

-- CreateTable
CREATE TABLE "operations" (
    "id" TEXT NOT NULL,
    "idUser" TEXT NOT NULL,
    "idAsset" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" INTEGER NOT NULL,
    "purchasePrice" DECIMAL(65,30) NOT NULL,
    "type" "AssetOperation" NOT NULL,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_idAsset_fkey" FOREIGN KEY ("idAsset") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
