ALTER TABLE "Annonce"
ADD COLUMN     "productType" TEXT,
ADD COLUMN     "volumeUnit" TEXT DEFAULT 'hl',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'France',
ADD COLUMN     "availabilityTiming" TEXT,
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "images" TEXT[];

UPDATE "Annonce"
SET
  "certifications" = COALESCE("certifications", ARRAY[]::TEXT[]),
  "images" = COALESCE("images", ARRAY[]::TEXT[]);

ALTER TABLE "Annonce"
ALTER COLUMN "certifications" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "certifications" SET NOT NULL,
ALTER COLUMN "images" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "images" SET NOT NULL;

CREATE INDEX "Annonce_status_idx" ON "Annonce"("status");
CREATE INDEX "Annonce_creatorUserId_idx" ON "Annonce"("creatorUserId");
CREATE INDEX "Annonce_entrepriseId_idx" ON "Annonce"("entrepriseId");
CREATE INDEX "Annonce_region_idx" ON "Annonce"("region");
