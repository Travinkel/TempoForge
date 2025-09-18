# TempoForge

![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?logo=.net&logoColor=white) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white) ![Fly.io](https://img.shields.io/badge/Deploy-Fly.io-0098FF)

TempoForge is a full-stack focus and sprint tracker that blends productivity coaching with light RPG feedback loops. The primary DaisyUI dashboard delivers a clean, actionable overview for ongoing sprints, while an optional Diablo-style HUD skin provides an immersive alternate layout that draws from the same sprint state.

---

## Requirements Coverage Checklist

- ✅ CRUD with .NET 8 API controllers (server/TempoForge.Api/Controllers/*)
- ✅ EF Core with Neon Postgres via Npgsql provider (server/TempoForge.Infrastructure/*)
- ✅ Swagger/OpenAPI docs exposed at `/swagger` for REST discovery
- ✅ DaisyUI theming with theme toggle + layout persistence (UserSettingsContext)
- ✅ Dual layouts: DaisyUI dashboard default, optional Diablo HUD toggle (hidden in production)
- ✅ Dockerized client and API images ready for registry pushes
- ✅ TestContainers-powered xUnit integration tests (server/TempoForge.Tests/*)

---

## Scope Management

- DaisyUI dashboard is the grading-safe baseline and the default production experience.
- Diablo HUD remains an opt-in skin accessible only in non-production builds unless explicitly enabled.
- Further HUD/gamification experiments continue in a separate branch to keep the submission aligned with KISS/YAGNI.

---

## Architecture Snapshot

```mermaid
flowchart LR
    subgraph Backend
        API[ASP.NET Core API]
        DB[(Neon Postgres via EF Core)]
    end
    subgraph Frontend
        CTX[Sprint & User Settings Contexts]
        D[DaisyUI Dashboard]
        H[Diablo HUD]
    end
    API --> CTX
    CTX --> D
    CTX --> H
```

---

## Project Overview
- Track focus sessions, sprint outcomes, and productivity stats in one place.
- DaisyUI dashboard ships as the primary UI, optimized for clarity and quick navigation.
- Diablo HUD skin can be toggled on for an immersive alternative without branching business logic.
- Gamification layers (streaks, quests, ranks) reinforce daily habit loops and highlight progression.
- Backend and frontend remain decoupled so either side can evolve independently.

## Tech Stack

### Backend
- .NET 8, ASP.NET Core REST controllers
- Entity Framework Core with the Npgsql provider for PostgreSQL (Neon)
- Swagger/OpenAPI for contract exploration
- xUnit with TestContainers-powered integration suites

### Frontend
- React 18 with Vite and TypeScript
- Tailwind CSS + DaisyUI themes and components
- Shared contexts (SprintContext, UserSettingsContext) for timer, layout, and theme persistence
- Lucide Icons for adaptive iconography

### Deployment & Ops
- Docker images for API (`tempoforge-api`) and client (`tempoforge-web`)
- Fly.io for hosting orchestrated containers
- Neon Postgres as the managed database tier

## Getting Started (Local)

### Clone the Repository
```bash
git clone https://github.com/your-org/tempoforge.git
cd tempoforge
```

### Backend API
```bash
dotnet restore
dotnet build TempoForge.sln
dotnet run --project server/TempoForge.Api/TempoForge.Api.csproj
```
- API serves `http://localhost:5000`; Swagger UI lives at `http://localhost:5000/swagger`.

### Frontend Client
```bash
cd client/tempoforge-web
npm install
npm run dev
```
- Vite dev server defaults to `http://localhost:5173`.

### Environment Variables
- `ConnectionStrings__Default` — Neon Postgres connection string for the API.
- `VITE_API_BASE_URL` — Base URL the client uses to call the API (e.g., `http://localhost:5000`).
- Configure via `.env`, `dotnet user-secrets`, or Fly.io secret stores; never commit credentials.

## Containerized Workflow

### Build & Run with Docker (Local)
```bash
# API
docker build -t tempoforge-api -f server/TempoForge.Api/Dockerfile .
docker run --rm -p 5000:5000 --env ConnectionStrings__Default="<neon-connection-string>" tempoforge-api

# Client
docker build -t tempoforge-web -f client/tempoforge-web/Dockerfile ./client/tempoforge-web
docker run --rm -p 4173:4173 --env VITE_API_BASE_URL="http://localhost:5000" tempoforge-web
```

### Deploying to Fly.io + Neon
1. Provision Neon database; capture the connection string (with pooling enabled if desired).
2. Deploy the API container to Fly.io:
   ```bash
   fly launch --name tempoforge-api --path server/TempoForge.Api
   fly secrets set ConnectionStrings__Default="<neon-connection-string>"
   fly deploy
   ```
3. Deploy the client container (static hosting) to Fly.io:
   ```bash
   fly launch --name tempoforge-web --path client/tempoforge-web --no-deploy
   fly secrets set VITE_API_BASE_URL="https://tempoforge-api.fly.dev"
   fly deploy
   ```
4. Verify `https://tempoforge-web.fly.dev` renders the DaisyUI dashboard by default; HUD toggle stays hidden in production per grading guidance.

## Testing
- Run the full backend suite (unit + integration):
  ```bash
  dotnet test server/TempoForge.Tests/TempoForge.Tests.csproj
  ```
- TestContainers spins up ephemeral Postgres instances to validate sprint flows end-to-end (start -> complete -> stats & streak updates).
- Add Vitest/React Testing Library as UI complexity grows around stateful components.

## Screenshots & Demo Media
- ![TempoForge Dashboard — DaisyUI (default)](docs/media/dashboard-daisyui.png)
- ![TempoForge Immersive HUD — Experimental](docs/media/dashboard-hud.png)

> DaisyUI captures are representative of the grading baseline. HUD screenshot is marked experimental and should only be enabled intentionally.

## Roadmap & Future Work
- Extend the HUD with interactive quests, portal animations, and celebratory rank-up effects.
- Introduce authenticated accounts to sync preferences across devices.
- Evaluate collaborative quest sharing and team-based leaderboards.
- Layer in automated frontend testing with Vitest and React Testing Library.

## Agentic Development Note
This project uses agentic AI prompts for refactoring, documentation, and code organization to accelerate iteration while maintaining reviewer transparency.




