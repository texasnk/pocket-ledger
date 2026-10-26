import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '../ui/field';

type MonthSelectProps = { value: string; onChange: (month: string) => void; ariaLabel: string };

/** Renderiza opções de mês com rótulos formatados no idioma selecionado. */
export function MonthSelect({ value, onChange, ariaLabel }: MonthSelectProps) {
  const { i18n } = useTranslation();
  const options = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - index);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = new Intl.DateTimeFormat(i18n.language, {
          month: 'long',
          year: 'numeric'
        }).format(date);
        return { key, label: label.charAt(0).toUpperCase() + label.slice(1) };
      }),
    [i18n.language]
  );
  return (
    <Select
      className="w-auto"
      testId="month-select"
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.key} value={option.key}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
