// src/features/transactions/TransactionsTable.tsx
import { useTransactions } from '../api';
import './transactions-table.scss';

export function TransactionsTable() {
  const { items, loading, error, page, pageSize, pageCount, setPage, setPageSize, total } =
    useTransactions();

  return (
    <div className="tx-table">
      <h1>Транзакции</h1>

      <div className="tx-toolbar">
        <div className="left">
          <span>Всего: {total}</span>
        </div>
        <div className="right">
          <label>
            На странице:&nbsp;
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="table">
        <div className="thead">
          <div>ID</div>
          <div>Время</div>
          <div>Отправитель</div>
          <div>Получатель</div>
          <div>Сумма</div>
          <div>Тип</div>
          <div>Категория</div>
          <div>Канал</div>
          <div>Локация</div>
          <div>Устройство</div>
          <div>Fraud</div>
        </div>

        {loading && <div className="row muted">Загрузка…</div>}
        {error && !loading && <div className="row error">Ошибка: {error}</div>}
        {!loading && !error && items.length === 0 && <div className="row muted">Нет данных</div>}

        <div className="tbody">
          {items.map((t) => (
            <div className="row" key={t.id}>
              <div>{t.id}</div>
              <div>{formatTs(t.timestamp)}</div>
              <div className="mono">{t.senderAccount}</div>
              <div className="mono">{t.receiverAccount}</div>
              <div className="mono">{t.amount}</div>
              <div>{t.transactionType}</div>
              <div>{t.merchantCategory}</div>
              <div>{t.paymentChannel}</div>
              <div>{t.location}</div>
              <div>{t.deviceUsed}</div>
              <div className={t.isFraud ? 'badge bad' : 'badge good'}>
                {t.isFraud ? 'Да' : 'Нет'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tx-pager">
        <button disabled={page <= 1} onClick={() => setPage(1)}>
          {'⏮'}
        </button>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          {'‹'}
        </button>
        <span>
          Стр. {page} / {pageCount}
        </span>
        <button disabled={page >= pageCount} onClick={() => setPage(page + 1)}>
          {'›'}
        </button>
        <button disabled={page >= pageCount} onClick={() => setPage(pageCount)}>
          {'⏭'}
        </button>
      </div>
    </div>
  );
}

function formatTs(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}
