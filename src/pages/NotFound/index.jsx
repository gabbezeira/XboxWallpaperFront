import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, Layers, Trophy, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
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

  const shortcuts = [
    {
      to: '/gallery',
      icon: <Compass size={20} />,
      name: 'Galeria Completa',
      desc: 'Navegue por todos os papéis de parede 4K',
    },
    {
      to: '/collections',
      icon: <Layers size={20} />,
      name: 'Coleções Oficiais',
      desc: 'Temas organizados por franquias e estúdios',
    },
    {
      to: '/levels',
      icon: <Trophy size={20} />,
      name: 'Níveis e Conquistas',
      desc: 'Evolução de patentes e cotas da comunidade',
    },
    {
      to: '/guide',
      icon: <BookOpen size={20} />,
      name: 'Guia de Aplicação',
      desc: 'Como configurar wallpapers direto no Xbox',
    },
  ];

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

        <section className={styles.shortcutsWrapper} aria-label="Destinos sugeridos">
          <h2 className={styles.shortcutsTitle}>Acesso rápido a seções do ecossistema</h2>

          <div className={styles.shortcutsGrid}>
            {shortcuts.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={styles.shortcutCard}
                tabIndex={0}
              >
                <div className={styles.shortcutMain}>
                  <div className={styles.shortcutIconBox} aria-hidden="true">
                    {item.icon}
                  </div>
                  <div className={styles.shortcutInfo}>
                    <span className={styles.shortcutName}>{item.name}</span>
                    <span className={styles.shortcutDesc}>{item.desc}</span>
                  </div>
                </div>
                <ArrowRight size={16} className={styles.shortcutArrow} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
