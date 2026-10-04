import { Component } from 'react';
import { RotateCcw, Home } from 'lucide-react';
import styles from './styles.module.scss';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('ErrorBoundary captured error:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className={styles.errorContainer}>
          <div className={styles.watermark} aria-hidden="true">
            500
          </div>

          <div className={styles.content}>
            <header className={styles.headerSection}>
              <span className={styles.kicker}>Instabilidade Temporária</span>
              <h1 className={styles.title}>Algo inesperado aconteceu</h1>
              <p className={styles.description}>
                Ocorreu uma falha ao renderizar esta tela. Você pode tentar recarregar a aplicação ou retornar para a página inicial.
              </p>
            </header>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={this.handleReload}
                tabIndex={0}
              >
                <RotateCcw size={18} />
                <span>Recarregar Página</span>
              </button>

              <button
                type="button"
                className={styles.btnSecondary}
                onClick={this.handleGoHome}
                tabIndex={0}
              >
                <Home size={18} />
                <span>Ir para o Início</span>
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
