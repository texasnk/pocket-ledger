import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useCatalogItems,
  useCreateCatalogItem,
  useDeleteCatalogItem
} from '../../hooks/use-catalog';
import { formatCents } from '../../lib/api';
import { catalogFormSchema, type CatalogFormValues } from '../../schemas/catalog-schema';
import type { CatalogKind } from '../../services/catalog';
import { DeleteButton } from '../../components/delete-button';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input, Select } from '../../ui/field';
import { Modal } from '../../ui/modal';
import { PageHeader } from '../../ui/page-header';

export function CatalogPage({ kind }: { kind: CatalogKind }) {
  const { t } = useTranslation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const form = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogFormSchema),
    defaultValues: { type: 'EXPENSE', color: '#94a3b8', initialBalance: 0 }
  });
  const items = useCatalogItems(kind);
  const create = useCreateCatalogItem(kind);
  const remove = useDeleteCatalogItem(kind);
  const submit = async (data: CatalogFormValues) => {
    await create.mutateAsync(data);
    form.reset();
    setCreateModalOpen(false);
  };
  const closeCreateModal = () => {
    form.reset();
    setCreateModalOpen(false);
  };
  const account = kind === 'accounts';
  return (
    <>
      <PageHeader
        title={t(account ? 'navigation.accounts' : 'navigation.categories')}
        testId="catalog-header"
      />
      <div className="space-y-5">
        <div className="flex justify-end">
          <Button onClick={() => setCreateModalOpen(true)} testId="catalog-create-button">
            {t(account ? 'catalog.newAccount' : 'catalog.newCategory')}
          </Button>
        </div>
        <Card className="p-5" testId="catalog-list">
          <h2 className="mt-0">{t(account ? 'navigation.accounts' : 'navigation.categories')}</h2>
          <div className="space-y-2">
            {items.isPending && (
              <p className="flex items-center gap-2 py-4 text-muted" role="status">
                <LoaderCircle className="animate-spin" size={18} />
                {t('catalog.loading')}
              </p>
            )}
            {!items.isPending && items.data?.length === 0 && (
              <p className="py-4 text-muted">
                {t(account ? 'catalog.emptyAccounts' : 'catalog.emptyCategories')}
              </p>
            )}
            {items.data?.map((item) => (
              <div
                className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3"
                key={item.id}
              >
                <span>
                  {'color' in item && (
                    <span
                      className="mr-2 inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}{' '}
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
                  {'balanceCents' in item && <span>{formatCents(item.balanceCents)}</span>}
                  <DeleteButton
                    onConfirm={() => remove.mutateAsync(item.id)}
                    isPending={remove.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {createModalOpen && (
        <Modal
          labelledBy="catalog-create-title"
          contentClassName="max-w-xl p-6"
          testId="catalog-create-modal"
        >
          <form data-testid="catalog-form" onSubmit={form.handleSubmit(submit)}>
            <h2 id="catalog-create-title" className="mt-0 text-lg">
              {t(account ? 'catalog.newAccount' : 'catalog.newCategory')}
            </h2>
            <p className="mt-2 text-muted">
              {t(account ? 'catalog.newAccountDescription' : 'catalog.newCategoryDescription')}
            </p>
            <div className="mt-6">
              <div className="mx-auto max-w-md space-y-4">
                <label className="block space-y-1 text-sm" htmlFor="catalog-name">
                  <span>{t('catalog.name')}</span>
                  <Input
                    id="catalog-name"
                    aria-describedby={form.formState.errors.name ? 'catalog-name-error' : undefined}
                    aria-invalid={Boolean(form.formState.errors.name)}
                    {...form.register('name')}
                  />
                  {form.formState.errors.name?.message && (
                    <span id="catalog-name-error" className="block text-sm text-expense" role="alert">
                      {t(form.formState.errors.name.message)}
                    </span>
                  )}
                </label>
                {account ? (
                  <label
                    className="block space-y-1 text-sm"
                    htmlFor="catalog-initial-balance"
                  >
                    <span>{t('catalog.initialBalance')}</span>
                    <Input
                      id="catalog-initial-balance"
                      type="number"
                      step="0.01"
                      aria-describedby={
                        form.formState.errors.initialBalance
                          ? 'catalog-initial-balance-error'
                          : undefined
                      }
                      aria-invalid={Boolean(form.formState.errors.initialBalance)}
                      {...form.register('initialBalance')}
                    />
                    {form.formState.errors.initialBalance?.message && (
                      <span
                        id="catalog-initial-balance-error"
                        className="block text-sm text-expense"
                        role="alert"
                      >
                        {t(form.formState.errors.initialBalance.message)}
                      </span>
                    )}
                  </label>
                ) : (
                  <>
                    <label className="block space-y-1 text-sm" htmlFor="catalog-type">
                      <span>{t('catalog.type')}</span>
                      <Select id="catalog-type" {...form.register('type')}>
                        <option value="EXPENSE">{t('transactions.expense')}</option>
                        <option value="INCOME">{t('transactions.income')}</option>
                      </Select>
                    </label>
                    <label className="block space-y-1 text-sm" htmlFor="catalog-color">
                      <span>{t('catalog.color')}</span>
                      <Input id="catalog-color" type="color" {...form.register('color')} />
                    </label>
                  </>
                )}
              </div>
              <div className="mt-8 flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  disabled={create.isPending}
                  onClick={closeCreateModal}
                  testId="catalog-create-cancel"
                >
                  {t('actions.cancel')}
                </Button>
                <Button type="submit" disabled={create.isPending} testId="catalog-add">
                  {create.isPending ? t('catalog.adding') : t('catalog.add')}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
