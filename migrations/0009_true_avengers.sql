ALTER TABLE "base"."tags" DISABLE ROW LEVEL SECURITY;

ALTER TABLE "base"."teams_to_tags" DISABLE ROW LEVEL SECURITY;

DROP TABLE "base"."tags" CASCADE;

DROP TABLE "base"."teams_to_tags" CASCADE;

ALTER TABLE "base"."teams"
DROP CONSTRAINT "teams_slug_unique";

DROP INDEX "base"."team_active_slug_idx";

DROP INDEX "base"."team_slug_idx";

ALTER TABLE "base"."teams"
DROP COLUMN "slug";