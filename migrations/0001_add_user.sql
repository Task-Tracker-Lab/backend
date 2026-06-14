CREATE TABLE
	"base"."user_activity" (
		"id" text PRIMARY KEY NOT NULL,
		"user_id" text NOT NULL,
		"event_type" varchar(50) NOT NULL,
		"entity_id" varchar,
		"metadata" jsonb,
		"created_at" timestamp
		with
			time zone DEFAULT now () NOT NULL
	);

CREATE TABLE "base"."user_notifications" (
	"user_id" text PRIMARY KEY NOT NULL,
	"settings" jsonb DEFAULT '{"email":{"task_assigned":true,"mentions":true,"daily_summary":false},"push":{"task_assigned":true,"reminders":true}}'::jsonb NOT NULL
);

CREATE TABLE
	"base"."user_preferences" (
		"user_id" text PRIMARY KEY NOT NULL,
		"theme" text DEFAULT 'system',
		"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
		"language" varchar(5) DEFAULT 'ru' NOT NULL
	);

CREATE TABLE
	"base"."user_security" (
		"user_id" text PRIMARY KEY NOT NULL,
		"password_hash" varchar(255),
		"recovery_email" varchar(255),
		"is_2fa_enabled" boolean DEFAULT false NOT NULL,
		"two_factor_secret" text,
		"last_login_at" timestamp
		with
			time zone,
			"last_password_change" timestamp
		with
			time zone DEFAULT now () NOT NULL
	);

CREATE TABLE
	"base"."users" (
		"id" text PRIMARY KEY NOT NULL,
		"username" varchar(50),
		"headline" varchar(200),
		"location" varchar(255),
		"first_name" varchar(50) NOT NULL,
		"last_name" varchar(50) NOT NULL,
		"middle_name" varchar(50),
		"email" varchar(255) NOT NULL,
		"bio" text,
		"phone" varchar(20),
		"vacation_start" timestamp
		with
			time zone,
			"vacation_end" timestamp
		with
			time zone,
			"vacation_message" varchar(255),
			"gender" text DEFAULT 'none',
			"pronouns" text DEFAULT 'none',
			"pronouns_custom" varchar(50),
			"avatar_url" varchar(512),
			"email_verified" boolean DEFAULT false NOT NULL,
			"email_verified_at" timestamp
		with
			time zone,
			"last_team_id" text,
			"deleted_at" timestamp
		with
			time zone,
			"created_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			"updated_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			CONSTRAINT "users_username_unique" UNIQUE ("username"),
			CONSTRAINT "users_email_unique" UNIQUE ("email")
	);

CREATE TABLE
	"base"."user_identities" (
		"id" text PRIMARY KEY NOT NULL,
		"user_id" text NOT NULL,
		"provider" varchar(50) NOT NULL,
		"provider_user_id" varchar(255) NOT NULL,
		"email" varchar(255) NOT NULL,
		"avatar_url" varchar(255),
		"created_at" timestamp
		with
			time zone DEFAULT now () NOT NULL,
			CONSTRAINT "provider_user_id_idx" UNIQUE ("provider", "provider_user_id")
	);

ALTER TABLE "base"."user_activity" ADD CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."user_notifications" ADD CONSTRAINT "user_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."user_security" ADD CONSTRAINT "user_security_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users" ("id") ON DELETE cascade ON UPDATE no action;