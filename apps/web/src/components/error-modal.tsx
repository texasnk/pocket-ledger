import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';

type ErrorModalProps = { message: string | null; onCancel: () => void; onRetry: () => void };

/** Exibe uma ação de recuperação bloqueante para erros de consultas e mutações. */
export function ErrorModal({ message, onCancel, onRetry }: ErrorModalProps) {
  const { t } = useTranslation();
  if (!message) return null;
  return (
    <Modal labelledBy="error-title" role="alertdialog" testId="error-modal">
      <div className="flex items-center gap-2 text-expense">
        <AlertCircle size={22} />
        <h2 id="error-title" className="m-0 text-lg">
          {t('errorDialog.title')}
        </h2>
      </div>
      <p className="mt-3 text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} testId="error-modal-cancel">
          {t('actions.cancel')}
        </Button>
        <Button onClick={onRetry} testId="error-modal-retry">
          {t('errorDialog.retry')}
        </Button>
      </div>
    </Modal>
  );
}
