CREATE TYPE "DocumentVisibility" AS ENUM ('PUBLIC', 'BUYER_ONLY');

ALTER TABLE "Document"
ADD COLUMN "visibility" "DocumentVisibility" NOT NULL DEFAULT 'PUBLIC';

CREATE INDEX "Document_visibility_idx" ON "Document"("visibility");
CREATE INDEX "Document_annonceId_idx" ON "Document"("annonceId");
