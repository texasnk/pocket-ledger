# Infrastructure

Drizzle/SQLite persistence adapters. This layer implements domain contracts and is the only layer that knows ORM details.

```mermaid
flowchart LR
  DrizzleRepository --> Drizzle --> SQLite
  DrizzleRepository --> DomainContracts
```
