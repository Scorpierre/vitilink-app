/*
  Warnings:

  - Added the required column `updatedAt` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'KBIS';
ALTER TYPE "DocumentType" ADD VALUE 'SIRENE_NOTICE';
ALTER TYPE "DocumentType" ADD VALUE 'VAT_CERTIFICATE';
ALTER TYPE "DocumentType" ADD VALUE 'RIB';
ALTER TYPE "DocumentType" ADD VALUE 'CVI_CERTIFICATE';
ALTER TYPE "DocumentType" ADD VALUE 'IDENTITY_PROOF';
ALTER TYPE "DocumentType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "entrepriseId" TEXT,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Entreprise" ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'France',
ADD COLUMN     "cviNumber" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "siren" VARCHAR(9),
ADD COLUMN     "siret" VARCHAR(14),
ADD COLUMN     "vatNumber" TEXT,
ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_entrepriseId_idx" ON "Document"("entrepriseId");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "Entreprise_status_idx" ON "Entreprise"("status");

-- CreateIndex
CREATE INDEX "Entreprise_siren_idx" ON "Entreprise"("siren");

-- CreateIndex
CREATE INDEX "Entreprise_siret_idx" ON "Entreprise"("siret");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
