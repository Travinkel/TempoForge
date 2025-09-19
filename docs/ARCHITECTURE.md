# Architecture

## Health Overview
| Dimension | Status | Notes |
|-----------|--------|-------|
| Features | Stable | Core focus flows reviewed after QuickStart updates. |
| Architecture | Improving | Interfaces + architecture tests guard layering now. |
| UX | Polished | DaisyUI modals replace disruptive prompts. |
| Tests | Expanded | Added Jest + NetArchTest coverage for UI and layering. |
| CI | Reliable | Updated workflow runs serialised tests. |
| Seeds | Ready | Existing seeding remains intact via DbContext. |
| Code Quality | Maintained | Services refactored to interface-driven design. |
| Docs | Enriched | New architecture overview and changelog entries. |

## PlantUML Overview
```plantuml
@startuml
skinparam packageStyle rectangle
skinparam defaultTextAlignment center

package "Domain" {
  [Domain]
}
package "Application" {
  [Application]
}
package "Infrastructure" {
  [Infrastructure]
}
package "API" {
  [API]
}
package "Frontend" {
  [Frontend]
}

[Domain] -> [Application]
[Application] -> [Infrastructure]
[Infrastructure] -> [API]
[API] -> [Frontend]

[Infrastructure] --> [Database]
[API] --> [Fly.io Deployment]

@enduml
```
