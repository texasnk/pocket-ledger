import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'icon' | 'plain';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  testId?: string;
};

const variantClassName: Record<ButtonVariant, string> = {
  primary: 'button',
  secondary: 'ui-button-secondary',
  danger: 'ui-button-danger',
  icon: 'icon-button',
  plain: ''
};

/** Botão reutilizável com variantes semânticas do design system. */
export function Button({
  children,
  className = '',
  variant = 'primary',
  testId = 'ui-button',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      data-testid={testId}
      className={`${variantClassName[variant]} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
