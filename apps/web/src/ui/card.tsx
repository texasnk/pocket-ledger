import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  testId?: string;
};

/** Superfície elevada reutilizável para agrupar conteúdo relacionado. */
export function Card({ children, className = '', testId = 'ui-card', ...props }: CardProps) {
  return (
    <article {...props} data-testid={testId} className={`card ${className}`.trim()}>
      {children}
    </article>
  );
}
