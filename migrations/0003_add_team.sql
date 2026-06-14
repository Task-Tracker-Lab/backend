CREATE TABLE
	"base"."team_members" (
		"team_id" text NOT NULL,
		"user_id" text NOT NULL,
		"role" "base"."team_role" DEFAULT 'member' NOT NULL,
		"status" "base"."member_status" DEFAULT 'inactive' NOT NULL,
		"joined_at" timestamp
		with
			time zone,
			"created_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			CONSTRAINT "team_members_team_id_user_id_pk" PRIMARY KEY ("team_id", "user_id")
	);

CREATE TABLE
	"base"."teams" (
		"id" text PRIMARY KEY NOT NULL,
		"name" varchar(100) NOT NULL,
		"description" text,
		"avatar_url" text,
		"cover_url" text,
		"owner_id" text,
		"created_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			"updated_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			"deleted_at" timestamp
		with
			time zone
	);

ALTER TABLE "base"."team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "base"."teams" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."teams" ADD CONSTRAINT "teams_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "base"."users" ("id") ON DELETE set null ON UPDATE no action;

CREATE INDEX "member_status_idx" ON "base"."team_members" USING btree ("status");

CREATE INDEX "member_role_idx" ON "base"."team_members" USING btree ("user_id", "role");

CREATE INDEX "team_owner_idx" ON "base"."teams" USING btree ("owner_id");

CREATE INDEX "team_deleted_at_idx" ON "base"."teams" USING btree ("deleted_at");