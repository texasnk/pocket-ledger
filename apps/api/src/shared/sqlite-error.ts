type SqliteError = {
  code?: string;
  message?: string;
};

/** Identifies foreign-key violations emitted by the supported SQLite drivers. */
export function isForeignKeyConstraint(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const { code, message } = error as SqliteError;
  return (
    code === 'SQLITE_CONSTRAINT_FOREIGNKEY' ||
    (code === 'ERR_SQLITE_ERROR' && message?.includes('FOREIGN KEY constraint failed') === true)
  );
}

/** Identifies uniqueness violations emitted by the supported SQLite drivers. */
export function isUniqueConstraint(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const { code, message } = error as SqliteError;
  return (
    code === 'SQLITE_CONSTRAINT_UNIQUE' ||
    (code === 'ERR_SQLITE_ERROR' && message?.includes('UNIQUE constraint failed') === true)
  );
}
