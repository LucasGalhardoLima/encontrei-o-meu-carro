-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price_avg" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spec" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "trunk_liters" INTEGER NOT NULL,
    "wheelbase" DOUBLE PRECISION NOT NULL,
    "ground_clearance" INTEGER NOT NULL,
    "fuel_consumption_city" DOUBLE PRECISION NOT NULL,
    "fuel_type" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "hp" INTEGER,
    "acceleration" DOUBLE PRECISION,
    "trunk_score" INTEGER NOT NULL DEFAULT 0,
    "wheelbase_score" INTEGER NOT NULL DEFAULT 0,
    "ground_clearance_score" INTEGER NOT NULL DEFAULT 0,
    "consumption_score" INTEGER NOT NULL DEFAULT 0,
    "hp_score" INTEGER NOT NULL DEFAULT 0,
    "acceleration_score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "thumbs" BOOLEAN NOT NULL,
    "weights" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Car_brand_idx" ON "Car"("brand");

-- CreateIndex
CREATE INDEX "Car_model_idx" ON "Car"("model");

-- CreateIndex
CREATE INDEX "Car_price_avg_idx" ON "Car"("price_avg");

-- CreateIndex
CREATE UNIQUE INDEX "Spec_carId_key" ON "Spec"("carId");

-- CreateIndex
CREATE INDEX "Spec_trunk_liters_idx" ON "Spec"("trunk_liters");

-- CreateIndex
CREATE INDEX "Spec_fuel_consumption_city_idx" ON "Spec"("fuel_consumption_city");

-- CreateIndex
CREATE INDEX "Feedback_carId_idx" ON "Feedback"("carId");

-- AddForeignKey
ALTER TABLE "Spec" ADD CONSTRAINT "Spec_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
