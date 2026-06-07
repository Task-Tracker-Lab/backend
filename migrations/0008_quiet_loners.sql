CREATE TABLE
	"base"."user_preferences" (
		"user_id" text PRIMARY KEY NOT NULL,
		"theme" text DEFAULT 'system',
		"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
		"language" varchar(5) DEFAULT 'ru' NOT NULL
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

ALTER TABLE "base"."user_security"
ALTER COLUMN "password_hash"
DROP NOT NULL;

ALTER TABLE "base"."user_security"
ADD COLUMN "recovery_email" varchar(255);

ALTER TABLE "base"."user_security"
ADD COLUMN "last_login_at" timestamp
with
	time zone;

ALTER TABLE "base"."users"
ADD COLUMN "username" varchar(50);

ALTER TABLE "base"."users"
ADD COLUMN "headline" varchar(200);

ALTER TABLE "base"."users"
ADD COLUMN "location" varchar(255);

ALTER TABLE "base"."users"
ADD COLUMN "phone" varchar(20);

ALTER TABLE "base"."users"
ADD COLUMN "vacation_start" timestamp
with
	time zone;

ALTER TABLE "base"."users"
ADD COLUMN "vacation_end" timestamp
with
	time zone;

ALTER TABLE "base"."users"
ADD COLUMN "vacation_message" varchar(255);

ALTER TABLE "base"."users"
ADD COLUMN "gender" text DEFAULT 'none';

ALTER TABLE "base"."users"
ADD COLUMN "pronouns" text DEFAULT 'none';

ALTER TABLE "base"."users"
ADD COLUMN "pronouns_custom" varchar(50);

ALTER TABLE "base"."users"
ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;

ALTER TABLE "base"."users"
ADD COLUMN "email_verified_at" timestamp
with
	time zone;

ALTER TABLE "base"."users"
ADD COLUMN "deleted_at" timestamp
with
	time zone;

ALTER TABLE "base"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "base"."users" ("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "base"."users"
DROP COLUMN "timezone";

ALTER TABLE "base"."users"
DROP COLUMN "language";

ALTER TABLE "base"."users" ADD CONSTRAINT "users_username_unique" UNIQUE ("username");