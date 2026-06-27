UPDATE "base"."states" SET "area_id" = 'corrupted_id' WHERE "area_id" IS NULL;

ALTER TABLE "base"."states" ALTER COLUMN "area_id" SET NOT NULL;