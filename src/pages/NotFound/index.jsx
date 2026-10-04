import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, ArrowLeft } from 'lucide-react';
import styles from './styles.module.scss';

export default function NotFound({
  code = '404',
  title = 'Página não encontrada',
  description = 'O link que você seguiu pode estar quebrado, o conteúdo pode ter sido removido ou o endereço foi digitado incorretamente.',
}) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.watermark} aria-hidden="true">
        {code}
      </div>

      <div className={styles.content}>
        <header className={styles.headerSection}>
          <span className={styles.kicker}>Erro de Navegação</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </header>

        <nav className={styles.actions} aria-label="Ações de recuperação">
          <Link to="/" className={styles.btnPrimary} tabIndex={0}>
            <Home size={18} />
            <span>Ir para o Início</span>
          </Link>

          <Link to="/gallery" className={styles.btnSecondary} tabIndex={0}>
            <Compass size={18} />
            <span>Explorar Galeria</span>
          </Link>

          <button
            type="button"
            className={styles.btnBack}
            onClick={handleGoBack}
            tabIndex={0}
          >
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </button>
        </nav>
      </div>
    </main>
  );
}
