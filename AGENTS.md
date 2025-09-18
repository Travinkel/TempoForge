# Repository Guidelines

## Project Structure & Module Organization
TempoForge combines a .NET 8 backend and Vite/React frontend. Server projects live under `server/` (Api, Application, Domain, Infrastructure, Tests). `TempoForge.Api` hosts the HTTP entry point and appsettings. `TempoForge.Application` carries use cases/DTOs, `TempoForge.Domain` keeps aggregates and enums, and `TempoForge.Infrastructure` exposes EF Core `TempoForgeDbContext`. Tests are grouped in `TempoForge.Tests`. The client resides in `client/tempoforge-web` with `src/` for React code, `public/` for static assets, and Tailwind/Vite configs at the root. Ops scripts land in `ops/`; supplementary references live in `docs/`.

## Build, Test, and Development Commands
From the repository root run `dotnet restore` followed by `dotnet build TempoForge.sln`. `dotnet run --project server/TempoForge.Api/TempoForge.Api.csproj` starts the API on `http://localhost:5000`. Inside `client/tempoforge-web`, execute `npm install`, then `npm run dev` or `npm run build`. Use `./start-dev.ps1` to boot both API and client in parallel PowerShell consoles.

## Coding Style & Naming Conventions
C# code uses four-space indentation, PascalCase for types, camelCase for locals and parameters, and appends `Async` to asynchronous methods. Nullable reference types stay enabled; projects treat warnings as errors, so fix them before committing. Reserve expression-bodied members for concise helpers. TypeScript/React files adopt ES modules, functional components, and two-space indentation. Name components and hooks in PascalCase, state setters as `setThing`, and group shared Tailwind utility layers inside `src/index.css`.

## Testing Guidelines
Run `dotnet test server/TempoForge.Tests/TempoForge.Tests.csproj` to execute the backend suite. Tests rely on xUnit `[Fact]`/`[Theory]` attributes plus the EF Core InMemory provider; follow the `MethodUnderTest_State_ExpectedBehavior` naming pattern and reset the context per test via factory helpers. Expand coverage around service-layer logic whenever you touch database behavior. Frontend automation is pending—introduce Vitest and Testing Library as React state becomes more complex, colocating specs beside the components in `src/`.

## Commit & Pull Request Guidelines
Commits follow Conventional Commit prefixes (`feat(api):`, `chore(frontend):`, etc.) and imperative subjects. Pull requests should summarise user impact, list key folders touched, link to issues, and confirm tests or linters were executed. Include screenshots or sample responses for UI/API changes and call out migrations or environment variable updates explicitly.

## Configuration & Environment
API connection strings live in `server/TempoForge.Api/appsettings*.json`; override with the `ConnectionStrings__Default` environment variable or local secrets. The client reads `VITE_API_BASE_URL` from `.env.development`. Keep secrets out of Git, prefer local `.env` overrides, and verify Swagger UI reflects new endpoints before merging.
