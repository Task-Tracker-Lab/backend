CREATE TYPE "base"."board_type" AS ENUM('kanban', 'calendar', 'gantt_matrix');
CREATE TYPE "base"."column_status" AS ENUM('backlog', 'todo', 'in_progress', 'done', 'canceled');
CREATE TABLE "base"."board_columns" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"name" varchar(50) NOT NULL,
	"status" "base"."column_status" DEFAULT 'backlog' NOT NULL,
	"visibility" boolean DEFAULT true NOT NULL,
	"position" double precision NOT NULL,
	"color" varchar(7) DEFAULT '#64748b' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "base"."boards_views" (
	"id" text PRIMARY KEY NOT NULL,
	"board_id" text NOT NULL,
	"type" "base"."board_type" DEFAULT 'kanban' NOT NULL,
	"name" varchar(100) NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"position" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "base"."boards" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"project_id" text NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"position" double precision NOT NULL,
	"owner_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "base"."board_columns" ADD CONSTRAINT "board_columns_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "base"."boards"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "base"."boards_views" ADD CONSTRAINT "boards_views_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "base"."boards"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "base"."boards" ADD CONSTRAINT "boards_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "base"."projects"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "base"."boards" ADD CONSTRAINT "boards_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "base"."users"("id") ON DELETE set null ON UPDATE no action;
CREATE UNIQUE INDEX "project_board_name_idx" ON "base"."boards" USING btree ("project_id","name");