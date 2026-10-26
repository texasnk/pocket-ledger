const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3333/api';
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init
  });
  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ message: 'Não foi possível concluir a operação.' }));
    throw new Error(body.message);
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}
export const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatCents = (value: unknown) => currency.format(Number(value ?? 0) / 100);
export const currentMonth = () => new Date().toISOString().slice(0, 7);
