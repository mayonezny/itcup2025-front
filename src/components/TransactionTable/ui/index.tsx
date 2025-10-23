import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { useTransactions } from '../../../features/transactions/api';
import './transactions-table.scss';

export function TransactionsTable() {
  const { items, loading, error, page, pageSize, pageCount, setPage, setPageSize, total } =
    useTransactions();

  return (
    <div className="tx-table">
      <h1 id="transactions">Транзакции</h1>

      <div className="tx-toolbar">
        <div className="left">
          <span className="muted">Всего: {total}</span>
        </div>
        <div className="right">
          <label className="tx-page-size">
            На странице:
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
          <div className="c c--id">ID корр.</div>
          <div className="c c--id">ID транз.</div>
          <div className="c">Отправитель</div>
          <div className="c">Получатель</div>
          <div className="c c--num">Сумма</div>
          <div className="c">Тип</div>
          <div className="c">Категория</div>
          <div className="c c--fraud">Фрод</div>
          <div className="c">Тип фрода</div>
          <div className="c c--status">Статусы</div>
        </div>

        {loading && <div className="row muted">Загрузка…</div>}
        {error && !loading && <div className="row error">Ошибка: {error}</div>}
        {!loading && !error && items.length === 0 && <div className="row muted">Нет данных</div>}

        <div className="tbody">
          {items.map((t) => (
            <div className="trow" key={t.id}>
              <div className="c c--id c--truncate" title={t.correlationId}>
                {t.correlationId}
              </div>
              <div className="c c--id c--truncate" title={t.transactionId}>
                {t.transactionId}
              </div>
              <div className="c mono c--truncate" title={t.senderAccount}>
                {t.senderAccount}
              </div>
              <div className="c mono c--truncate" title={t.receiverAccount}>
                {t.receiverAccount}
              </div>
              <div className="c mono c--num">{t.amount}</div>
              <div className="c">{t.transactionType}</div>
              <div className="c">{t.merchantCategory}</div>
              <div className="c c--fraud">
                <span className={`pill ${t.isFraud ? 'pill--bad' : 'pill--ok'}`}>
                  {t.isFraud ? 'Да' : 'Нет'}
                </span>
              </div>
              <div className="c c--truncate" title={t.fraudType ?? '—'}>
                {t.fraudType ?? '—'}
              </div>
              <div className="c c--status c--truncate" title={t.statuses.at(-1)?.datetime}>
                {formatTs(t.statuses.at(-1)?.datetime ?? '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tx-pager">
        <button
          className="icon-btn"
          disabled={page <= 1}
          onClick={() => setPage(1)}
          title="В начало"
        >
          <ChevronsLeft />
        </button>
        <button
          className="icon-btn"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          title="Назад"
        >
          <ChevronLeft />
        </button>
        <span className="tx-pager__info">
          Стр. {page} / {pageCount}
        </span>
        <button
          className="icon-btn"
          disabled={page >= pageCount}
          onClick={() => setPage(page + 1)}
          title="Вперёд"
        >
          <ChevronRight />
        </button>
        <button
          className="icon-btn"
          disabled={page >= pageCount}
          onClick={() => setPage(pageCount)}
          title="В конец"
        >
          <ChevronsRight />
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
