-- Convert feedback weights from text to jsonb, preserving existing data.
ALTER TABLE "Feedback"
ALTER COLUMN "weights" TYPE JSONB
USING "weights"::jsonb;
