CREATE TYPE "base"."issue_type" AS ENUM ('bug', 'task', 'epic');

CREATE TYPE "base"."priority" AS ENUM ('critical', 'low', 'medium', 'high');

CREATE TABLE
	"base"."issues" (
		"id" text PRIMARY KEY NOT NULL,
		"title" varchar(255) NOT NULL,
		"description" text,
		"description_html" text,
		"priority" "priority" DEFAULT 'medium' NOT NULL,
		"type" "issue_type" DEFAULT 'task' NOT NULL,
		"area_id" text NOT NULL,
		"state_id" text,
		"position" integer DEFAULT 0,
		"assignee_id" text,
		"reporter_id" text,
		"parent_id" text,
		"story_points" integer,
		"due_date" timestamp
		with
			time zone,
			"created_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			"updated_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			"deleted_at" timestamp
		with
			time zone,
			CONSTRAINT "no_self_parent" CHECK (
				"base"."issues"."parent_id" IS NULL
				OR "base"."issues"."parent_id" != "base"."issues"."id"
			)
	);

ALTER TABLE "base"."issues" ADD CONSTRAINT "issues_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "base"."areas" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."issues" ADD CONSTRAINT "issues_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "base"."states" ("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "base"."issues" ADD CONSTRAINT "issues_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "base"."users" ("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "base"."issues" ADD CONSTRAINT "issues_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "base"."users" ("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "base"."issues" ADD CONSTRAINT "issues_parent_id_issues_id_fk" FOREIGN KEY ("parent_id") REFERENCES "base"."issues" ("id") ON DELETE set null ON UPDATE no action;

CREATE INDEX "idx_issue_area_state" ON "base"."issues" USING btree ("area_id", "state_id", "position")
WHERE
	"base"."issues"."deleted_at" IS NULL;

CREATE INDEX "idx_issue_assignee" ON "base"."issues" USING btree ("assignee_id")
WHERE
	"base"."issues"."deleted_at" IS NULL;

CREATE INDEX "idx_issue_parent" ON "base"."issues" USING btree ("parent_id")
WHERE
	"base"."issues"."deleted_at" IS NULL;

CREATE INDEX "idx_issue_priority" ON "base"."issues" USING btree ("priority")
WHERE
	"base"."issues"."deleted_at" IS NULL;

CREATE INDEX "idx_issue_type" ON "base"."issues" USING btree ("type")
WHERE
	"base"."issues"."deleted_at" IS NULL;

CREATE INDEX "idx_issue_search" ON "base"."issues" USING gin (
	to_tsvector (
		'english',
		COALESCE("title", '') || ' ' || COALESCE("description", '')
	)
)
WHERE
	"base"."issues"."deleted_at" IS NULL;