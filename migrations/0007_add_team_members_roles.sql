ALTER TABLE "base"."team_members" ALTER COLUMN "role" SET DATA TYPE text;
ALTER TABLE "base"."team_members" ALTER COLUMN "role" SET DEFAULT 'member'::text;
DROP TYPE "base"."team_role";
CREATE TYPE "base"."team_role" AS ENUM('owner', 'admin', 'member', 'viewer');
ALTER TABLE "base"."team_members" ALTER COLUMN "role" SET DEFAULT 'member'::"base"."team_role";
ALTER TABLE "base"."team_members" ALTER COLUMN "role" SET DATA TYPE "base"."team_role" USING "role"::"base"."team_role";