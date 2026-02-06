-- Store average car price as fixed precision decimal for financial consistency.
ALTER TABLE "Car"
ALTER COLUMN "price_avg" TYPE DECIMAL(12, 2)
USING ROUND("price_avg"::numeric, 2);
