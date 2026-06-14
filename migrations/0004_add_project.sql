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

CREATE TABLE
	"base"."project_shares" (
		"id" text PRIMARY KEY NOT NULL,
		"project_id" text NOT NULL,
		"token" text NOT NULL,
		"expires_at" timestamp
		with
			time zone,
			"created_by" text,
			"created_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			CONSTRAINT "project_shares_token_unique" UNIQUE ("token")
	);

CREATE TABLE
	"base"."projects" (
		"id" text PRIMARY KEY NOT NULL,
		"team_id" text NOT NULL,
		"slug" varchar(100) NOT NULL,
		"name" varchar(100) NOT NULL,
		"description" text,
		"descriptionHtml" text,
		"icon" varchar(255),
		"color" varchar(7),
		"status" "base"."project_status" DEFAULT 'active' NOT NULL,
		"sequence" integer DEFAULT 0,
		"owner_id" text,
		"visibility" "base"."project_visibility" DEFAULT 'public' NOT NULL,
		"created_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			"updated_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			"deleted_at" timestamp
		with
			time zone,
			CONSTRAINT "projects_slug_unique" UNIQUE ("slug")
	);

ALTER TABLE "base"."project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "base"."projects" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."project_members" ADD CONSTRAINT "project_members_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "base"."users" ("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "base"."project_settings" ADD CONSTRAINT "project_settings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "base"."projects" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."project_settings" ADD CONSTRAINT "project_settings_default_assignee_id_users_id_fk" FOREIGN KEY ("default_assignee_id") REFERENCES "base"."users" ("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "base"."project_shares" ADD CONSTRAINT "project_shares_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "base"."projects" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."project_shares" ADD CONSTRAINT "project_shares_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "base"."users" ("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "base"."projects" ADD CONSTRAINT "projects_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "base"."teams" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "base"."users" ("id") ON DELETE set null ON UPDATE no action;

CREATE UNIQUE INDEX "project_member_unique_idx" ON "base"."project_members" USING btree ("project_id", "user_id");

CREATE INDEX "project_member_user_idx" ON "base"."project_members" USING btree ("user_id");

CREATE INDEX "project_member_project_idx" ON "base"."project_members" USING btree ("project_id");

CREATE UNIQUE INDEX "project_settings_project_idx" ON "base"."project_settings" USING btree ("project_id");

CREATE INDEX "token_idx" ON "base"."project_shares" USING btree ("token");

CREATE INDEX "project_share_project_id_idx" ON "base"."project_shares" USING btree ("project_id");

CREATE UNIQUE INDEX "project_team_slug_idx" ON "base"."projects" USING btree ("team_id", "slug")
WHERE
	"base"."projects"."deleted_at" is null;

CREATE INDEX "project_owner_id_idx" ON "base"."projects" USING btree ("owner_id");

CREATE INDEX "project_team_id_idx" ON "base"."projects" USING btree ("team_id");