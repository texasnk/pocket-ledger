import { useState } from 'react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Modal } from '../ui/modal';

type DeleteButtonProps = { onConfirm: () => Promise<unknown>; isPending?: boolean };

/** Solicita confirmação explícita antes de executar uma exclusão irreversível. */
export function DeleteButton({ onConfirm, isPending = false }: DeleteButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const confirm = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      setOpen(false);
    }
  };
  return (
    <>
      <Button
        variant="icon"
        className="rounded p-1 text-expense hover:bg-[var(--primary-soft)]"
        aria-label={t('actions.delete')}
        disabled={isPending}
        onClick={() => setOpen(true)}
        testId="delete-button"
      >
        {isPending ? <LoaderCircle className="animate-spin" size={18} /> : <Trash2 size={18} />}
      </Button>
      {open && (
        <Modal labelledBy="delete-title" testId="delete-modal">
          <h2 id="delete-title" className="mt-0 text-lg">
            {t('deleteDialog.title')}
          </h2>
          <p className="text-muted">{t('deleteDialog.description')}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={isPending}
              onClick={() => setOpen(false)}
              testId="delete-modal-cancel"
            >
              {t('actions.cancel')}
            </Button>
            <Button
              variant="danger"
              disabled={isPending}
              onClick={confirm}
              testId="delete-modal-confirm"
            >
              {isPending ? t('actions.deleting') : t('actions.delete')}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
