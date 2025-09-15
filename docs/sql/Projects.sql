-- EF Core Migration SQL Preview for Projects table (PostgreSQL)
-- Generated to reflect TempoForge.Infrastructure.Data.TempoForgeDbContext model

CREATE TABLE "Projects" (
    "Id" uuid NOT NULL,
    "Name" character varying(80) NOT NULL,
    "Track" integer NOT NULL,
    "Pinned" boolean NOT NULL DEFAULT FALSE,
    "CreatedAt" timestamp with time zone NOT NULL
);

ALTER TABLE "Projects"
    ADD CONSTRAINT "PK_Projects" PRIMARY KEY ("Id");

CREATE INDEX "IX_Projects_Track" ON "Projects" ("Track"); 