-- Align the database with the current Prisma schema.
-- The architecture refactor created Entreprise and Document before the
-- verification/address fields were added to schema.prisma.

ALTER TABLE "Entreprise"
ADD COLUMN     "siren" VARCHAR(9),
ADD COLUMN     "siret" VARCHAR(14),
ADD COLUMN     "vatNumber" TEXT,
ADD COLUMN     "cviNumber" TEXT,
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'France',
ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

CREATE INDEX "Entreprise_status_idx" ON "Entreprise"("status");
CREATE INDEX "Entreprise_siren_idx" ON "Entreprise"("siren");
CREATE INDEX "Entreprise_siret_idx" ON "Entreprise"("siret");

ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'KBIS';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'SIRENE_NOTICE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'VAT_CERTIFICATE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'RIB';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'CVI_CERTIFICATE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'IDENTITY_PROOF';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'OTHER';

CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Document"
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "entrepriseId" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Document_type_idx" ON "Document"("type");
CREATE INDEX "Document_status_idx" ON "Document"("status");
CREATE INDEX "Document_entrepriseId_idx" ON "Document"("entrepriseId");
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

ALTER TABLE "Document" ADD CONSTRAINT "Document_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
