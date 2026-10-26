import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  filters?: ReactNode;
  testId?: string;
};

/** Cabeçalho de página que mantém título e filtros na mesma hierarquia visual. */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
  filters,
  testId = 'ui-page-header'
}: PageHeaderProps) {
  return (
    <>
      <header className="page-header" data-testid={testId}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </header>
      {filters && (
        <div className="filter-bar" data-testid={`${testId}-filters`}>
          {filters}
        </div>
      )}
    </>
  );
}
