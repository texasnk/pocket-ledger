import { readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const summaryPath = resolve('coverage', 'coverage-summary.json');
const reportPath = resolve('C8_COVERAGE_REPORT.html');
const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
const formatPercentage = (metric) => `${metric.pct.toFixed(2)}%`;
const renderMetricCells = (metrics) =>
  ['lines', 'statements', 'functions', 'branches']
    .map((key) => `<td>${formatPercentage(metrics[key])}</td>`)
    .join('');
const files = Object.entries(summary)
  .filter(([file]) => file !== 'total')
  .sort(([first], [second]) => first.localeCompare(second));
const generatedAt = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'medium'
}).format(new Date());
const rows = files
  .map(
    ([file, metrics]) =>
      `<tr><td><code>${escapeHtml(relative(process.cwd(), file).replaceAll('\\', '/'))}</code></td>${renderMetricCells(metrics)}</tr>`
  )
  .join('');

await writeFile(
  reportPath,
  `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cobertura c8 — Pocket Ledger API</title>
    <style>
      body { background: #0f172a; color: #e2e8f0; font: 16px/1.5 system-ui, sans-serif; margin: 0; }
      main { margin: 3rem auto; max-width: 1000px; padding: 0 1.5rem; }
      .metrics, table { background: #1e293b; border-collapse: collapse; border-radius: .75rem; overflow: hidden; width: 100%; }
      .metrics { display: grid; grid-template-columns: repeat(4, 1fr); margin: 1.5rem 0; }
      .metric { padding: 1rem; } .metric strong { display: block; color: #5eead4; font-size: 1.5rem; }
      th, td { border-bottom: 1px solid #334155; padding: .75rem; text-align: left; } th { color: #94a3b8; }
      code { color: #cbd5e1; } .muted { color: #94a3b8; }
      @media (max-width: 640px) { .metrics { grid-template-columns: repeat(2, 1fr); } main { margin-top: 1.5rem; } }
    </style>
  </head>
  <body>
    <main>
      <h1>Cobertura de código — c8</h1>
      <p class="muted">Pocket Ledger API · gerado em ${generatedAt}</p>
      <section class="metrics" aria-label="Cobertura total">
        <div class="metric"><span>Linhas</span><strong>${formatPercentage(summary.total.lines)}</strong></div>
        <div class="metric"><span>Instruções</span><strong>${formatPercentage(summary.total.statements)}</strong></div>
        <div class="metric"><span>Funções</span><strong>${formatPercentage(summary.total.functions)}</strong></div>
        <div class="metric"><span>Ramificações</span><strong>${formatPercentage(summary.total.branches)}</strong></div>
      </section>
      <table>
        <thead><tr><th>Arquivo</th><th>Linhas</th><th>Instruções</th><th>Funções</th><th>Ramificações</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </main>
  </body>
</html>\n`
);
