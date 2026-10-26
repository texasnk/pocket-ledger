import { useTranslation } from 'react-i18next';
import { useHistory } from '../../hooks/use-history';
import { Card } from '../../ui/card';
import { PageHeader } from '../../ui/page-header';
export function HistoryPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useHistory();
  if (isLoading) return <p className="text-muted">{t('history.loading')}</p>;
  return (
    <>
      <PageHeader
        title={t('history.title')}
        subtitle={t('history.description')}
        testId="history-header"
      />
      <Card className="p-5" testId="history-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm text-muted">
              <tr>
                <th>{t('history.action')}</th>
                <th>{t('history.entity')}</th>
                <th>{t('history.record')}</th>
                <th>{t('history.date')}</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item) => (
                <tr className="border-t border-[var(--border)]" key={item.id}>
                  <td className="py-3">{t(`audit.${item.action}`)}</td>
                  <td>{t(`auditEntity.${item.entity}`)}</td>
                  <td className="font-mono text-xs">{item.entityId}</td>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
