import { AlertCircle, ArrowDownRight, ArrowUpRight, WalletCards } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MonthSelect } from '../../components/month-select';
import { useDashboard } from '../../hooks/use-dashboard';
import { categoryColor, chartColor, chartTooltipStyle } from '../../lib/chart-colors';
import { currentMonth, formatCents } from '../../lib/api';
import { Card } from '../../ui/card';
import { PageHeader } from '../../ui/page-header';

function Metric({
  label,
  value,
  icon: Icon,
  tone = ''
}: {
  label: string;
  value: number;
  icon: typeof WalletCards;
  tone?: string;
}) {
  return (
    <Card
      className="metric-card p-5"
      testId={`dashboard-metric-${label.toLocaleLowerCase().replaceAll(' ', '-')}`}
    >
      <div className="mb-5 flex items-center justify-between text-muted">
        <span>{label}</span>
        <span className="metric-icon">
          <Icon size={19} />
        </span>
      </div>
      <strong className={`text-2xl ${tone}`}>{formatCents(value)}</strong>
    </Card>
  );
}

export function DashboardPage({ titleKey = 'navigation.dashboard' }: { titleKey?: string }) {
  const { t } = useTranslation();
  const [month, setMonth] = useState(currentMonth);
  const { data, isLoading, error } = useDashboard(month);
  if (isLoading) return <p className="text-muted">Carregando resumo financeiro…</p>;
  if (error || !data)
    return (
      <p className="status-error">
        <AlertCircle />
        {t('dashboard.error')}
      </p>
    );

  return (
    <>
      <PageHeader
        title={t(titleKey)}
        eyebrow="Financial overview"
        subtitle={t('dashboard.intro')}
        filters={<MonthSelect ariaLabel={t('dashboard.month')} value={month} onChange={setMonth} />}
        testId="dashboard-header"
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Saldo disponível"
          value={data.balanceCents}
          icon={WalletCards}
          tone="text-balance"
        />
        <Metric label="Receitas" value={data.incomeCents} icon={ArrowUpRight} tone="text-income" />
        <Metric
          label="Despesas"
          value={data.expenseCents}
          icon={ArrowDownRight}
          tone="text-expense"
        />
        <Metric
          label="Resultado do mês"
          value={data.resultCents}
          icon={WalletCards}
          tone="text-balance"
        />
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="chart-card p-5" testId="income-expense-chart">
          <h2 className="chart-title">Receitas versus despesas</h2>
          <p className="chart-description">Valores em reais, por período.</p>
          <ResponsiveContainer width="100%" height="88%">
            <BarChart data={data.evolution} margin={{ top: 20, right: 8, left: 4, bottom: 0 }}>
              <CartesianGrid stroke={chartColor('grid')} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: chartColor('axis'), fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `R$ ${value / 100}`}
                tick={{ fill: chartColor('axis'), fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={66}
              />
              <Tooltip
                formatter={(value: number) => formatCents(value)}
                contentStyle={chartTooltipStyle}
                cursor={{ fill: 'var(--surface-hover)' }}
              />
              <Legend wrapperStyle={{ color: chartColor('axis'), fontSize: 12 }} />
              <Bar
                name="Receitas"
                dataKey="incomeCents"
                fill={chartColor('income')}
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                name="Despesas"
                dataKey="expenseCents"
                fill={chartColor('expense')}
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="chart-card p-5" testId="category-chart">
          <h2 className="chart-title">Despesas por categoria</h2>
          <p className="chart-description">
            Cada categoria mantém a mesma cor em toda a aplicação.
          </p>
          {data.byCategory.length ? (
            <ResponsiveContainer width="100%" height="88%">
              <PieChart>
                <Pie
                  data={data.byCategory}
                  dataKey="amountCents"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="var(--surface)"
                  strokeWidth={2}
                >
                  {data.byCategory.map((item) => (
                    <Cell key={item.name} fill={categoryColor(item.name)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCents(value)}
                  contentStyle={chartTooltipStyle}
                />
                <Legend wrapperStyle={{ color: chartColor('axis'), fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted">Nenhuma despesa neste mês.</p>
          )}
        </Card>
      </section>
      <Card className="mt-5 p-5" testId="latest-transactions">
        <h2 className="chart-title">Últimas transações</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm text-muted">
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Data</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.latest.map((item) => (
                <tr className="border-t border-[var(--border)]" key={item.id}>
                  <td className="py-3 font-bold">{item.description}</td>
                  <td>{item.category?.name ?? 'Transferência'}</td>
                  <td>{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                  <td
                    className={`text-right font-bold ${item.type === 'EXPENSE' ? 'text-expense' : 'text-income'}`}
                  >
                    {item.type === 'EXPENSE' ? '-' : '+'}
                    {formatCents(item.amountCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
