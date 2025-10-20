import './header.scss';

export const Header = () => {
  const ivan = 0;
  return (
    <header className="header">
      <div className="logo">
        <img src="/images/logo.png" alt="Logo" width={84} height={84} />
        <div>
          <h2 className="app-name">FraudDetector</h2>
          <h5>Система обнаружения подозрительных транзакций в реальном времени</h5>
        </div>
      </div>
    </header>
  );
};
