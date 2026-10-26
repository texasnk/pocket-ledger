import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAccounts, useCategories, useCreateCategory } from '../../hooks/use-catalog';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions
} from '../../hooks/use-transactions';
import { currentMonth, formatCents } from '../../lib/api';
import {
  transactionFormSchema,
  type TransactionFormValues
} from '../../schemas/transaction-schema';
import { categoryCreationSchema, type CategoryCreationValues } from '../../schemas/catalog-schema';
import { useState } from 'react';
import { MonthSelect } from '../../components/month-select';
import { DeleteButton } from '../../components/delete-button';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input, Select } from '../../ui/field';
import { Modal } from '../../ui/modal';
import { PageHeader } from '../../ui/page-header';

const transactionDefaults = {
  date: new Date().toISOString().slice(0, 10),
  type: 'EXPENSE' as const,
  installments: 1,
  isFixed: false,
  fixedDuration: 1
};

const categoryDefaults: CategoryCreationValues = { name: '', type: 'EXPENSE', color: '#94a3b8' };

export function TransactionsPage() {
  const { t } = useTranslation();
  const [month, setMonth] = useState(currentMonth);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [categoryCreationOpen, setCategoryCreationOpen] = useState(false);
  const [step, setStep] = useState(1);
  const accounts = useAccounts();
  const categories = useCategories();
  const list = useTransactions(month);
  const create = useCreateTransaction();
  const createCategory = useCreateCategory();
  const remove = useDeleteTransaction();
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transactionDefaults
  });
  const categoryForm = useForm<CategoryCreationValues>({
    resolver: zodResolver(categoryCreationSchema),
    defaultValues: categoryDefaults
  });
  const transactionType = form.watch('type');
  const isFixedExpense = form.watch('isFixed');
  const submit = async (data: TransactionFormValues) => {
    await create.mutateAsync(data);
    form.reset(transactionDefaults);
    categoryForm.reset(categoryDefaults);
    setCategoryCreationOpen(false);
    setStep(1);
    setCreateModalOpen(false);
  };
  const closeCreateModal = () => {
    form.reset(transactionDefaults);
    categoryForm.reset(categoryDefaults);
    setCategoryCreationOpen(false);
    setStep(1);
    setCreateModalOpen(false);
  };
  const continueToDetails = async () => {
    const isValid = await form.trigger(['accountId', 'categoryId', 'description', 'amount']);
    if (isValid) setStep(2);
  };
  const selectCategory = (categoryId: string) => {
    form.setValue('categoryId', categoryId, { shouldValidate: true });
    const category = categories.data?.find((item) => item.id === categoryId);
    if (category) form.setValue('type', category.type);
  };
  const createCategoryFromTransaction = async (category: CategoryCreationValues) => {
    const createdCategory = await createCategory.mutateAsync(category);
    selectCategory(createdCategory.id);
    categoryForm.reset(categoryDefaults);
    setCategoryCreationOpen(false);
  };
  return (
    <>
      <PageHeader
        title={t('navigation.transactions')}
        filters={
          <MonthSelect ariaLabel={t('transactions.month')} value={month} onChange={setMonth} />
        }
        testId="transactions-header"
      />
      <div className="mb-5 flex justify-end">
        <Button onClick={() => setCreateModalOpen(true)} testId="transaction-create-button">
          {t('transactions.new')}
        </Button>
      </div>
      <Card className="overflow-x-auto p-5" testId="transactions-table">
        <table className="w-full text-left">
          <caption className="caption-top pb-3 text-left text-sm text-muted">
            {t('transactions.records', { count: list.data?.total ?? 0 })}
          </caption>
          <thead className="text-sm text-muted">
            <tr>
              <th>{t('table.description')}</th>
              <th>{t('transactions.account')}</th>
              <th>{t('table.category')}</th>
              <th>{t('table.date')}</th>
              <th className="text-right">{t('table.value')}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!list.isPending && list.data?.items.length === 0 && (
              <tr>
                <td className="py-8 text-center text-muted" colSpan={6}>
                  {t('transactions.empty')}
                </td>
              </tr>
            )}
            {list.data?.items.map((item) => (
              <tr className="border-t border-[var(--border)]" key={item.id}>
                <td className="py-3 font-bold">{item.description}</td>
                <td>{item.account.name}</td>
                <td>{item.category?.name ?? '—'}</td>
                <td>{new Date(item.date).toLocaleDateString()}</td>
                <td className="text-right">{formatCents(item.amountCents)}</td>
                <td>
                  <DeleteButton
                    onConfirm={() => remove.mutateAsync(item.id)}
                    isPending={remove.isPending}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {createModalOpen && (
        <Modal
          labelledBy="transaction-create-title"
          contentClassName="max-w-xl p-6"
          testId="transaction-create-modal"
        >
          <form data-testid="transaction-form" onSubmit={form.handleSubmit(submit)}>
            <div className="flex items-center justify-between gap-4">
              <h2 id="transaction-create-title" className="m-0 text-lg">
                {t('transactions.new')}
              </h2>
              <span className="text-sm text-muted">
                {t('transactions.step', { current: step })}
              </span>
            </div>
            <div className="mt-6 mx-auto max-w-md space-y-4">
              {step === 1 ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-1 text-sm" htmlFor="transaction-account">
                      <span>{t('transactions.account')}</span>
                      <Select id="transaction-account" {...form.register('accountId')}>
                        <option value="">{t('transactions.account')}</option>
                        {accounts.data?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Select>
                      {form.formState.errors.accountId?.message && (
                        <span className="block text-sm text-expense" role="alert">
                          {t(form.formState.errors.accountId.message)}
                        </span>
                      )}
                    </label>
                    <label className="block space-y-1 text-sm" htmlFor="transaction-category">
                      <span>{t('transactions.category')}</span>
                      <Select
                        id="transaction-category"
                        {...form.register('categoryId')}
                        onChange={(event) => selectCategory(event.target.value)}
                      >
                        <option value="">{t('transactions.category')}</option>
                        {categories.data?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Select>
                      {form.formState.errors.categoryId?.message && (
                        <span className="block text-sm text-expense" role="alert">
                          {t(form.formState.errors.categoryId.message)}
                        </span>
                      )}
                    </label>
                  </div>
                  <div>
                    <Button
                      variant="plain"
                      type="button"
                      onClick={() => setCategoryCreationOpen((isOpen) => !isOpen)}
                    >
                      {t('transactions.createCategory')}
                    </Button>
                    {categoryCreationOpen && (
                      <div className="mt-3 space-y-3 rounded-lg border border-[var(--border)] p-4">
                        <h3 className="m-0 text-sm">{t('catalog.newCategory')}</h3>
                        <Input placeholder={t('catalog.name')} {...categoryForm.register('name')} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Select {...categoryForm.register('type')}>
                            <option value="EXPENSE">{t('transactions.expense')}</option>
                            <option value="INCOME">{t('transactions.income')}</option>
                          </Select>
                          <Input type="color" {...categoryForm.register('color')} />
                        </div>
                        {categoryForm.formState.errors.name?.message && (
                          <p className="m-0 text-sm text-expense" role="alert">
                            {t(categoryForm.formState.errors.name.message)}
                          </p>
                        )}
                        <Button
                          type="button"
                          disabled={createCategory.isPending}
                          onClick={categoryForm.handleSubmit(createCategoryFromTransaction)}
                        >
                          {createCategory.isPending ? t('catalog.adding') : t('catalog.add')}
                        </Button>
                      </div>
                    )}
                  </div>
                  <label className="block space-y-1 text-sm" htmlFor="transaction-description">
                    <span>{t('transactions.description')}</span>
                    <Input id="transaction-description" {...form.register('description')} />
                    {form.formState.errors.description?.message && (
                      <span className="block text-sm text-expense" role="alert">
                        {t(form.formState.errors.description.message)}
                      </span>
                    )}
                  </label>
                  <label className="block space-y-1 text-sm" htmlFor="transaction-amount">
                    <span>{t('transactions.amount')}</span>
                    <Input
                      id="transaction-amount"
                      type="number"
                      step="0.01"
                      {...form.register('amount')}
                    />
                    {form.formState.errors.amount?.message && (
                      <span className="block text-sm text-expense" role="alert">
                        {t(form.formState.errors.amount.message)}
                      </span>
                    )}
                  </label>
                </>
              ) : (
                <>
                  <label className="block space-y-1 text-sm" htmlFor="transaction-date">
                    <span>{t('table.date')}</span>
                    <Input id="transaction-date" type="date" {...form.register('date')} />
                  </label>
                  <label className="block space-y-1 text-sm" htmlFor="transaction-installments">
                    <span>{t('transactions.installments')}</span>
                    <Input
                      id="transaction-installments"
                      type="number"
                      {...form.register('installments')}
                    />
                  </label>
                  {transactionType === 'EXPENSE' && (
                    <>
                      <label
                        className="flex items-center gap-2 text-sm"
                        htmlFor="transaction-fixed"
                      >
                        <input
                          id="transaction-fixed"
                          className="h-4 w-4 accent-[var(--primary)]"
                          type="checkbox"
                          {...form.register('isFixed')}
                        />
                        <span>{t('transactions.fixedExpense')}</span>
                      </label>
                      {isFixedExpense && (
                        <label
                          className="block space-y-1 text-sm"
                          htmlFor="transaction-fixed-duration"
                        >
                          <span>{t('transactions.fixedDuration')}</span>
                          <Input
                            id="transaction-fixed-duration"
                            type="number"
                            min="1"
                            max="120"
                            {...form.register('fixedDuration')}
                          />
                        </label>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
            <div className="mt-8 flex items-center justify-between gap-3">
              <div className="flex gap-3">
                <Button variant="secondary" disabled={create.isPending} onClick={closeCreateModal}>
                  {t('actions.cancel')}
                </Button>
                {step === 2 && (
                  <Button variant="plain" disabled={create.isPending} onClick={() => setStep(1)}>
                    {t('actions.back')}
                  </Button>
                )}
              </div>
              {step === 1 ? (
                <Button type="button" onClick={continueToDetails} testId="transaction-continue">
                  {t('actions.continue')}
                </Button>
              ) : (
                <Button type="submit" disabled={create.isPending} testId="transaction-save">
                  {t('transactions.save')}
                </Button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
