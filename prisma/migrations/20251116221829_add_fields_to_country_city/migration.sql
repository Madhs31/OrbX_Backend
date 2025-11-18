-- AlterTable
ALTER TABLE "cities" ADD COLUMN     "area" DOUBLE PRECISION,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "timezone" TEXT;

-- AlterTable
ALTER TABLE "countries" ADD COLUMN     "area" DOUBLE PRECISION,
ADD COLUMN     "callingCode" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "description" TEXT DEFAULT '',
ADD COLUMN     "language" TEXT;
