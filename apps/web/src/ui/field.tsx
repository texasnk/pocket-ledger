import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { testId?: string };
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { testId?: string };

/** Campo de texto reutilizável com estados visuais consistentes. */
export function Input({ className = '', testId = 'ui-input', ...props }: InputProps) {
  return <input {...props} data-testid={testId} className={`field ${className}`.trim()} />;
}

/** Select reutilizável com o mesmo tratamento visual dos demais campos. */
export function Select({ className = '', testId = 'ui-select', ...props }: SelectProps) {
  return <select {...props} data-testid={testId} className={`field ${className}`.trim()} />;
}
