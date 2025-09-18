-- EF Core Migration SQL Preview for Projects table (PostgreSQL)
-- Generated to reflect TempoForge.Infrastructure.Data.TempoForgeDbContext model

CREATE TABLE "Projects" (
    "Id" uuid NOT NULL,
    "Name" character varying(80) NOT NULL,
    "IsFavorite" boolean NOT NULL DEFAULT FALSE,
    "CreatedAt" timestamptz NOT NULL,
    "LastUsedAt" timestamptz NULL
);

ALTER TABLE "Projects"
    ADD CONSTRAINT "PK_Projects" PRIMARY KEY ("Id");

-- Support favorites filter + recents ordering
CREATE INDEX "IX_Projects_IsFavorite" ON "Projects" ("IsFavorite");
CREATE INDEX "IX_Projects_LastUsedAt" ON "Projects" ("LastUsedAt");

