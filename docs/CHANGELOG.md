# Changelog

All notable changes to **TempoForge** will be documented in this file.  
Following [Conventional Commits](https://www.conventionalcommits.org).

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

### Changed
- Moved backend projects into `/server` folder (aligns with Alex’s “server/client” convention).
- Cleaned `TempoForge.sln` to remove root-level project references.
- Updated client to use `.env.development` for API base URL.
- Fixed `vite.config.ts` by adding `@vitejs/plugin-react`.

### Removed
- Deleted initial `TempoForge/` hello-world console app.
- Removed root-level `bin/` and `obj` build artifacts.

---
