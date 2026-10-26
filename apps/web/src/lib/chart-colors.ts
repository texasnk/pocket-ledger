export const chartCategoricalLight = [
  '#027F62',
  '#497AC6',
  '#A87322',
  '#7F6AB5',
  '#C65F62',
  '#287D85',
  '#B05F2A',
  '#617F32'
] as const;

export const chartCategoricalDark = [
  '#57C4A1',
  '#8BB7FF',
  '#E5B567',
  '#B7A0E7',
  '#F0878E',
  '#68CBD1',
  '#E7A573',
  '#A9C77D'
] as const;

export type ChartToken =
  | 'income'
  | 'expense'
  | 'balance'
  | 'warning'
  | 'projection'
  | 'grid'
  | 'axis'
  | 'tooltipBackground'
  | 'tooltipBorder';

export const chartColor = (token: ChartToken) => `var(--chart-${token})`;

/** A stable hash means a category never changes colour when its sort order changes. */
export function categoryColor(categoryId: string) {
  let hash = 0;
  for (const character of categoryId) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return `var(--chart-category-${Math.abs(hash) % chartCategoricalLight.length})`;
}

export const chartTooltipStyle = {
  backgroundColor: 'var(--chart-tooltip-background)',
  border: '1px solid var(--chart-tooltip-border)',
  borderRadius: 10,
  boxShadow: 'var(--shadow-float)',
  color: 'var(--foreground)'
};
