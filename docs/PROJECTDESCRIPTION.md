# Week 38–40 Project Brief

This document consolidates Alex Uldahl’s Moodle brief for the joint Programming II / Systems Development project. Use it as the internal reference for scope, tooling, and support windows.

---

## Timeline & Availability

| Date | Format | Notes |
| --- | --- | --- |
| Mon 15 Sep | Remote drop-in | Zoom office hours 09:00-13:30 (https://easv-dk.zoom.us/j/5425519295) |
| Tue 16 Sep | On-site lesson | Deep dive on EF inserts, seed data, HTTP error handling, `.env` PowerShell tips, plus workshop time |
| Wed 17 Sep | Project workday | Optional Zoom (same link) 10:00-13:30; otherwise async support via email |

Parental leave notices will be announced on Moodle. Unless a “Parental leave announcement” appears, plan on the standard timetable above.

---

## Deliverables & Submission

- Work alone or in teams of up to three.
- Submit **before week 41**:
  - Public repository URL (GitHub).
  - Deployment URL(s) for API and client.
  - GitHub username(s).
- Every team member must submit the links individually. Add a README note if you prefer to skip feedback.

Optional inspiration: [Reference solution commits](https://github.com/uldahlalex/ProjectSolution/) map each recipe step to a Git history checkpoint.

---

## Core Technology Requirements (all ideas)

### Backend
- .NET 8 + C# Web API using controllers.
- Entity Framework Core with PostgreSQL (Npgsql provider).
- Data validation on create/update/delete; return RFC 7807 `ProblemDetails` on failure.
- Swagger/OpenAPI documentation enabled.
- Dockerised API deployment.
- Automated tests with xUnit, Dependency Injection, and TestContainers PostgreSQL (see Systems Dev II Testing ? Week 37).

### Frontend
- React 18 + TypeScript via Vite.
- React Router (data APIs encouraged).
- Optional state tooling (e.g., Jotai) – but routing is mandatory.
- Dockerised deployment.

### Tooling
- Version control in a public Git repo.
- Recommended helper scripts:
  ```powershell
  # PowerShell snippet for sourcing .env before scaffolding
  Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
      $name = $matches[1].Trim()
      $value = $matches[2].Trim()
      [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
  }
  ```

---

## Project Options

### 1. Library Management (Alex’s default idea)
- Entities: `Author`, `Book`, `Genre`, and `AuthorBookJunction` (many-to-many).
- Goal: Full CRUD across the three main aggregates, surface them in the client.
- Lending is out of scope by default; feel free to extend the schema.
- The original PostgreSQL schema (for scaffolding) lives in the Moodle brief; port it verbatim if you adopt this idea.

### 2. Self-defined Concept
- You may design your own domain provided all technology requirements above are satisfied.
- Align feature scope with the given time frame (weeks 38–40).

---

## Recommended Workflow (“Recipe”)

1. Create root solution structure and initialise Git (`dotnet new gitignore`).
2. Scaffold Vite client in `/client`; set up `/server` with Api / Application / Domain / Infrastructure / Tests projects.
3. Add NuGet packages, project references, and align .NET versions.
4. Provision a Neon PostgreSQL database; connect via Rider/your IDE.
5. Define tables (or use the provided schema) and scaffold EF models.
6. Add configuration binding (Options pattern) and validate via DI or annotations.
7. Register controllers, middleware, Swagger, and NSwag TypeScript generation.
8. Configure CORS in `Program.cs`.
9. Implement application services, DTOs, and controllers iteratively (throw `NotImplementedException` as placeholders if helpful).
10. Set up Dockerfile(s) and Fly.io deployment configs for API/client.
11. Wire TestContainers PostgreSQL in test project startup.
12. In React: configure routing, fetch layer (NSwag client), and UI components.
13. Iterate feature-by-feature: UI ? state ? API contract ? backend implementation ? tests ? regenerate TypeScript client ? connect UI.

---

## Support & References

- Zoom help desk: https://easv-dk.zoom.us/j/5425519295
- Example solution (commit-by-commit guide): https://github.com/uldahlalex/ProjectSolution/
- TestContainers sample: https://github.com/uldahlalex/testcontainersdemointernational
- Additional references in Systems Development II (Weeks 37–38).

---

## Notes

- Monday of week 41 resumes normal Programming lessons with new topics.
- Keep `.env` secrets out of source control; rely on local overrides or deployment secrets.
- Submit early if you want prompt feedback from Alex.
