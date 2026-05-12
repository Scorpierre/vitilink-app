-- Add missing verification fields to Document table
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "verificationScore" INTEGER;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "verificationReason" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "extractedData" JSONB;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "processedAt" TIMESTAMP(3);
