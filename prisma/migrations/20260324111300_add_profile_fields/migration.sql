-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SELLER', 'BUYER', 'BOTH');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('EARL', 'GAEC', 'SAS', 'SARL', 'COOPERATIVE', 'NEGOCE', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "annualVolume" DOUBLE PRECISION,
ADD COLUMN     "appellations" TEXT[],
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyType" "CompanyType",
ADD COLUMN     "department" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "grapeVarieties" TEXT[],
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'BUYER',
ADD COLUMN     "soughtProducts" TEXT[],
ADD COLUMN     "soughtVolume" TEXT,
ADD COLUMN     "surfaceHa" DOUBLE PRECISION;
