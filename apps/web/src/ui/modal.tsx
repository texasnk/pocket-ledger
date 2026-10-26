import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

type ModalProps = {
  children: ReactNode;
  labelledBy: string;
  role?: 'dialog' | 'alertdialog';
  testId?: string;
  contentClassName?: string;
};

/** Modal renderizado no body para manter backdrop e centralização independentes do layout pai. */
export function Modal({
  children,
  labelledBy,
  role = 'dialog',
  testId = 'ui-modal',
  contentClassName = ''
}: ModalProps) {
  return createPortal(
    <div
      className="modal-backdrop"
      role={role}
      aria-modal="true"
      aria-labelledby={labelledBy}
      data-testid={testId}
    >
      <div
        className={`card w-full max-w-sm p-5 ${contentClassName}`.trim()}
        data-testid={`${testId}-content`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
