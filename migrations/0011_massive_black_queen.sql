CREATE TABLE
	"base"."areas" (
		"id" text PRIMARY KEY NOT NULL,
		"project_id" text,
		"title" text NOT NULL,
		"slug" varchar(100) NOT NULL,
		"description" text,
		"description_html" text,
		"color" varchar(10),
		"tasks_count" integer DEFAULT 0 NOT NULL,
		"default_view" varchar(20) DEFAULT 'kanban' NOT NULL,
		"icon" varchar(20),
		"position" integer DEFAULT 0 NOT NULL,
		"max_tasks_limit" integer,
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
			time zone,
			CONSTRAINT "areas_slug_unique" UNIQUE ("slug")
	);

ALTER TABLE "base"."areas" ADD CONSTRAINT "areas_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "base"."projects" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."areas" ADD CONSTRAINT "areas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "base"."users" ("id") ON DELETE no action ON UPDATE no action;

CREATE INDEX "idx_areas_slug" ON "base"."areas" USING btree ("slug");

CREATE INDEX "idx_areas_project_active" ON "base"."areas" USING btree ("project_id", "position")
WHERE
	"base"."areas"."deleted_at" is null;

CREATE INDEX "idx_areas_created_by" ON "base"."areas" USING btree ("created_by")
WHERE
	"base"."areas"."deleted_at" is null;

CREATE INDEX "idx_areas_deleted_at" ON "base"."areas" USING btree ("deleted_at")
WHERE
	"base"."areas"."deleted_at" is not null;