DROP SCHEMA IF EXISTS "base" CASCADE;

CREATE SCHEMA "base";

CREATE TYPE "base"."team_role" AS ENUM (
    'owner',
    'admin',
    'lead',
    'moderator',
    'member',
    'viewer'
);

CREATE TYPE "base"."member_status" AS ENUM ('active', 'banned', 'inactive');

CREATE TYPE "base"."layout_type" AS ENUM ('kanban', 'list', 'calendar', 'gantt');

CREATE TYPE "base"."project_status" AS ENUM ('active', 'archived', 'template', 'deleted');

CREATE TYPE "base"."project_visibility" AS ENUM ('public', 'private');

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