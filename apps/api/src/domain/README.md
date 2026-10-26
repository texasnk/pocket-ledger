# Domain

Contém entidades, tipos, contratos e invariantes financeiros. Não pode importar Express, Drizzle ou qualquer adaptador externo.

```mermaid
flowchart LR
  Rules[Regras e invariantes] --> Contracts[Contratos de repositório]
  Contracts --> Application
```

Valores são centavos inteiros; transferências exigem contas diferentes e valores positivos.
