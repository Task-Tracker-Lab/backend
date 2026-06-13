CREATE TYPE "base"."layout_type" AS ENUM ('kanban', 'list', 'calendar', 'gantt');

ALTER TYPE "base"."project_status" ADD VALUE 'deleted';

CREATE TABLE
	"base"."project_members" (
		"id" text PRIMARY KEY NOT NULL,
		"project_id" text NOT NULL,
		"user_id" text NOT NULL,
		"role" varchar(20) DEFAULT 'member' NOT NULL,
		"added_by" text,
		"created_at" timestamp
		with
			time zone DEFAULT now () NOT NULL
	);

CREATE TABLE
	"base"."project_settings" (
		"id" text PRIMARY KEY NOT NULL,
		"project_id" text NOT NULL,
		"default_view" "base"."layout_type" DEFAULT 'kanban' NOT NULL,
		"task_prefix" varchar(10),
		"auto_close_days" integer,
		"max_tasks_per_area" integer,
		"max_members" integer,
		"max_areas" integer,
		"allow_guests" boolean DEFAULT false,
		"time_tracking" boolean DEFAULT false,
		"time_tracking_mode" varchar(20) DEFAULT 'optional',
		"default_assignee_id" text,
		"created_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			"updated_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			CONSTRAINT "project_settings_project_id_unique" UNIQUE ("project_id")
	);

DROP INDEX "base"."project_team_key_idx";

DROP INDEX "base"."project_team_name_idx";

ALTER TABLE "base"."project_shares"
ALTER COLUMN "created_by"
DROP NOT NULL;

ALTER TABLE "base"."users"
ADD COLUMN "last_team_id" text;

ALTER TABLE "base"."projects"
ADD COLUMN "slug" varchar(100) NOT NULL;

ALTER TABLE "base"."projects"
ADD COLUMN "descriptionHtml" text;

ALTER TABLE "base"."projects"
ADD COLUMN "sequence" integer DEFAULT 0;

ALTER TABLE "base"."project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "base"."projects" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."project_members" ADD CONSTRAINT "project_members_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "base"."users" ("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "base"."project_settings" ADD CONSTRAINT "project_settings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "base"."projects" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."project_settings" ADD CONSTRAINT "project_settings_default_assignee_id_users_id_fk" FOREIGN KEY ("default_assignee_id") REFERENCES "base"."users" ("id") ON DELETE set null ON UPDATE no action;

CREATE UNIQUE INDEX "project_member_unique_idx" ON "base"."project_members" USING btree ("project_id", "user_id");

CREATE INDEX "project_member_user_idx" ON "base"."project_members" USING btree ("user_id");

CREATE INDEX "project_member_project_idx" ON "base"."project_members" USING btree ("project_id");

CREATE UNIQUE INDEX "project_settings_project_idx" ON "base"."project_settings" USING btree ("project_id");

ALTER TABLE "base"."project_shares" ADD CONSTRAINT "project_shares_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "base"."users" ("id") ON DELETE no action ON UPDATE no action;

CREATE UNIQUE INDEX "project_team_slug_idx" ON "base"."projects" USING btree ("team_id", "slug")
WHERE
	"base"."projects"."deleted_at" is null;

ALTER TABLE "base"."projects"
DROP COLUMN "key";

ALTER TABLE "base"."projects"
DROP COLUMN "task_sequence";

ALTER TABLE "base"."projects"
DROP COLUMN "settings";

ALTER TABLE "base"."projects" ADD CONSTRAINT "projects_slug_unique" UNIQUE ("slug");