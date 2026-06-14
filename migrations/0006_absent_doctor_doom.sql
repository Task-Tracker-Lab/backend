ALTER TABLE "base"."team_members"
ALTER COLUMN "joined_at"
SET
    DATA TYPE timestamp
with
    time zone;

ALTER TABLE "base"."team_members"
ALTER COLUMN "created_at"
SET
    DATA TYPE timestamp
with
    time zone;

ALTER TABLE "base"."team_members"
ALTER COLUMN "created_at"
SET DEFAULT now ();

ALTER TABLE "base"."teams"
ALTER COLUMN "created_at"
SET
    DATA TYPE timestamp
with
    time zone;

ALTER TABLE "base"."teams"
ALTER COLUMN "created_at"
SET DEFAULT now ();

ALTER TABLE "base"."teams"
ALTER COLUMN "updated_at"
SET
    DATA TYPE timestamp
with
    time zone;

ALTER TABLE "base"."teams"
ALTER COLUMN "updated_at"
SET DEFAULT now ();

ALTER TABLE "base"."teams"
ALTER COLUMN "deleted_at"
SET
    DATA TYPE timestamp
with
    time zone;

ALTER TABLE "base"."project_shares"
ALTER COLUMN "created_at"
SET
    DATA TYPE timestamp
with
    time zone;

ALTER TABLE "base"."project_shares"
ALTER COLUMN "created_at"
SET DEFAULT now ();

ALTER TABLE "base"."projects"
ALTER COLUMN "created_at"
SET
    DATA TYPE timestamp
with
    time zone;

ALTER TABLE "base"."projects"
ALTER COLUMN "created_at"
SET DEFAULT now ();

ALTER TABLE "base"."projects"
ALTER COLUMN "updated_at"
SET
    DATA TYPE timestamp
with
    time zone;

ALTER TABLE "base"."projects"
ALTER COLUMN "updated_at"
SET DEFAULT now ();

ALTER TABLE "base"."projects"
ALTER COLUMN "deleted_at"
SET
    DATA TYPE timestamp
with
    time zone;