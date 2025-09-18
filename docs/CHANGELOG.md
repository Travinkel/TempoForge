# Changelog

## [1.0.0] – 2025-09-18

### Added
- API: `/api/stats/*` endpoints now backed by `StatsService` with quest-aware summaries.
- API: `/api/quests/active` and `/api/quests/{id}/claim` wired to the new `QuestService` and quest domain entity.
- Infrastructure: `Quest` table migration plus seeding script supplying demo data for stats, favorites, and quests.
- Frontend: DaisyUI cards call live stats, progress, favorites, recent, and quests APIs; QuickStart uses SprintContext POST wiring.
- Frontend: Quest panels (DaisyUI & HUD) animate completions with checkmarks, strikethrough transitions, and placeholder media captures.
- Tests: QuestService unit coverage, refreshed TestContainers scenarios for sprint lifecycle + favorites, quest integration assertions.
- Docs: README feature checklist, Fly.io deployment guide, run scripts, and screenshot placeholders; changelog updated for MVP milestone.

### Changed
- Sprint completion now advances daily/weekly/epic quests via `QuestService` and excludes aborted runs from streak/minute stats.
- Dashboard grid unified (QuickStart, Stats, Progress, Favorites, Recent) with skeleton loaders; HUD stats panel shows lifetime totals.

### Removed
- Legacy quest CRUD references replaced with consolidated active/claim pipeline.

---

## [0.2.1] – 2025-09-18

### Added
- docs: Reworked docs/PROJECTDESCRIPTION.md into a structured internal project brief covering scope, timeline, and workflow.

### Changed
- repo: Added docs/PROJECTDESCRIPTION.md to .gitignore to keep the brief out of public builds.

---

All notable changes to **TempoForge** will be documented in this file.  
Following [Conventional Commits](https://www.conventionalcommits.org).

---

## [0.2.0] – 2025-09-17

### Added
- Repo structure finalized under `/server`, `/client`, `/ops` for full-stack workflow.
- Connected API to Neon Postgres (Development connection configured in `appsettings.Development.json`).
- EF Core aligned to 9.0.1 and Npgsql provider aligned to 9.0.4 across projects.
- Created and applied initial EF Core migration `InitProjects` to Neon DB.
- Projects feature end-to-end:
  - Domain entity: `Project` (Id, Name, Track, Pinned, CreatedAt).
  - Application service: `ProjectService` with CRUD + validation (name 3–80, track required).
  - API controller: `ProjectsController` with GET/POST/PUT/DELETE.
  - Swagger/OpenAPI includes Projects endpoints.
- Frontend scaffolding:
  - React components `ProjectForm` and `ProjectList` (scaffold) and `/projects` page wiring for list/create.
- Tests:
  - xUnit tests for `ProjectService` using Testcontainers PostgreSQL; fallback strategy planned for InMemory provider on constrained machines (Shadow PC).

### Changed
- Updated package versions to EF Core 9.0.1 and Npgsql 9.0.4 for compatibility with Neon.
- API configuration updated to read Neon connection from development settings.

### Fixed
- Test project SDK and references corrected (`TempoForge.Tests.csproj`) to enable running xUnit with (planned) Testcontainers.
- Verified and fixed React ? API CRUD flow against Neon (stability tweaks to DTO validation and controller wiring).

### Removed
- No removals in this release.

---

## [0.2.0] – 2025-09-15

### Added
- **API**
  - ProjectsController with CRUD endpoints: GET/POST/PUT/DELETE /api/projects.
  - DTO validation (name 3–80 chars, track required). Returns ProblemDetails on invalid input.
  - Swagger docs updated to include Projects endpoints.
- **Domain/Infrastructure**
  - Project entity (Id, Name, Track, Pinned, CreatedAt).
  - EF Core DbContext configured and initial migration (Projects table, indexes).
- **Application**
  - ProjectService with CRUD logic and guardrails.
- **Tests**
  - xUnit + Testcontainers PostgreSQL test verifies create + name length validation.
- **Client**
  - Projects page lists projects and provides a create form (name, track) wired to API.
- **DevOps**
  - Docker Compose runs db, api (8080), and web (5173). API applies migrations in Development.

### Changed
- Program startup applies EF Core migrations automatically in Development.

---

## [0.1.0] – 2025-09-15

### Added
- **Architecture**
    - Established `/server` and `/client` folder structure.
    - Added layered backend projects: `TempoForge.Api`, `TempoForge.Application`, `TempoForge.Domain`, `TempoForge.Infrastructure`, `TempoForge.Tests`.
    - React client scaffolded with Vite + TypeScript in `client/tempoforge-web`.
- **API**
    - `HealthController` with `GET /api/health` returning `{ status, timeUtc }`.
    - Swagger enabled for API docs.
- **Client**
    - Home page fetches `/api/health` using `VITE_API_BASE_URL`.
    - Basic navbar with routes (Dashboard, Projects, Focus, History).
- **Dev Tooling**
    - `.gitignore` updated for .NET + React + IDE junk.
    - `start-dev.ps1` script to launch API and client together.
- **Docs**
    - README with setup instructions.
    - Initial UX flow definition (Dashboard, Projects, Focus, History, Progress, Settings, About).
- **Projects**: entity, service, controller; Neon Postgres connectivity validated end-to-end via Swagger (`POST /api/projects`, `GET /api/projects`).
    - **EF Core 9.0.9 + Npgsql 9.0.4** alignment across projects; initial migration `InitProjects` applied to Neon.
    - CI: GitHub Actions workflow to build API, run **Testcontainers** tests, and build client.

### Changed
- Moved backend projects into `/server` folder (aligns with Alex’s “server/client” convention).
- Cleaned `TempoForge.sln` to remove root-level project references.
- Updated client to use `.env.development` for API base URL.
- Fixed `vite.config.ts` by adding `@vitejs/plugin-react`.
- Connection strings standardized to key=value for Npgsql (SSL Require + TrustServerCertificate for dev).
  
### Removed
- Deleted initial `TempoForge/` hello-world console app.
- Removed root-level `bin/` and `obj` build artifacts.

---



