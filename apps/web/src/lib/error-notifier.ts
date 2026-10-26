export type ApplicationError = { message: string };
export const applicationErrorEvent = 'pocket-ledger:error';

/** Broadcasts errors raised by hooks so the shell can present a consistent recovery dialog. */
export function notifyApplicationError(reason: unknown): void {
  const message =
    reason instanceof Error ? reason.message : 'Não foi possível concluir a operação.';
  window.dispatchEvent(
    new CustomEvent<ApplicationError>(applicationErrorEvent, { detail: { message } })
  );
}
