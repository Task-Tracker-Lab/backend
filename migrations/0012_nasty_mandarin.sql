CREATE TYPE "base"."state_category" AS ENUM (
	'backlog',
	'active',
	'review',
	'completed',
	'archived'
);

CREATE TYPE "base"."state_type" AS ENUM (
	'backlog',
	'todo',
	'in_progress',
	'review',
	'done',
	'archived',
	'custom'
);

CREATE TABLE
	"base"."states" (
		"id" text PRIMARY KEY NOT NULL,
		"area_id" text,
		"title" text NOT NULL,
		"description" text,
		"state_type" "state_type" DEFAULT 'custom' NOT NULL,
		"category" "state_category" DEFAULT 'active' NOT NULL,
		"color" varchar(10),
		"icon" varchar(20),
		"position" integer DEFAULT 0 NOT NULL,
		"is_visible" boolean DEFAULT true NOT NULL,
		"max_tasks_limit" integer,
		"auto_transition_to" text,
		"notify_on_enter" boolean DEFAULT false,
		"notify_on_exit" boolean DEFAULT false,
		"is_locked" boolean DEFAULT false,
		"created_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			"updated_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			"created_by" text,
			"deleted_at" timestamp
		with
			time zone
	);

ALTER TABLE "base"."states" ADD CONSTRAINT "states_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "base"."areas" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."states" ADD CONSTRAINT "states_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "base"."users" ("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX "idx_states_position" ON "base"."states" USING btree ("area_id", "position");

CREATE INDEX "idx_states_title" ON "base"."states" USING btree ("area_id", "title");

CREATE INDEX "idx_states_created_at" ON "base"."states" USING btree ("area_id", "created_at");

CREATE INDEX "idx_states_search" ON "base"."states" USING btree ("area_id", "title");

CREATE UNIQUE INDEX "idx_states_unique_title" ON "base"."states" USING btree ("area_id", "title")
WHERE
	"base"."states"."deleted_at" is null;

CREATE INDEX "idx_states_deleted_at" ON "base"."states" USING btree ("deleted_at")
WHERE
	"base"."states"."deleted_at" is not null;