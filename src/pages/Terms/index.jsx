import { ShieldCheck } from 'lucide-react';
import avatar from '../../assets/avatar.jpeg';
import styles from './styles.module.scss';

export default function Terms() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        <header className={styles.header}>
          <h1 className={styles.title}>Termos de Uso</h1>
          <p className={styles.subtitle}>Leia com atenção antes de utilizar a plataforma.</p>
          <div className={styles.divider} />
        </header>

        <div className={styles.content}>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Aviso Legal</h2>
            <div className={styles.highlight}>
              <ShieldCheck size={20} className={styles.highlightIcon} />
              <p className={styles.highlightText}>
                O <strong>Spartan Wallpapers</strong> é um projeto independente, sem fins lucrativos,
                desenvolvido exclusivamente por fãs da plataforma Xbox.
                <br /><br />
                Este site <strong>não é</strong> afiliado, associado, autorizado, endossado ou de qualquer
                forma oficialmente conectado à <strong>Microsoft Corporation</strong>, ao <strong>Xbox</strong> ou
                qualquer uma de suas subsidiárias e afiliadas.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Marcas Registradas</h2>
            <p className={styles.sectionText}>
              Os nomes <strong>Xbox</strong> e <strong>Microsoft</strong>, bem como nomes, marcas, logotipos e
              imagens relacionadas, são marcas registradas de seus respectivos proprietários. Qualquer uso
              feito nesta plataforma tem finalidade estritamente referencial e de identificação, sem
              qualquer intenção de violação de direitos autorais ou propriedade intelectual.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Uso de Dados</h2>
            <p className={styles.sectionText}>
              Respeitamos a sua privacidade. Os dados coletados através da autenticação Microsoft —
              como nome de exibição e foto de perfil — são utilizados única e exclusivamente para
              personalizar a sua experiência dentro da plataforma, permitindo que você salve wallpapers
              favoritos e envie conteúdo para a galeria da comunidade.
            </p>
            <p className={styles.sectionText}>
              Nenhum dado pessoal é compartilhado com terceiros ou utilizado para fins comerciais.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Conteúdo da Comunidade</h2>
            <p className={styles.sectionText}>
              Os wallpapers disponíveis na plataforma são enviados por membros da comunidade.
              Ao enviar conteúdo, você confirma que possui os direitos necessários ou que o material
              está disponível para uso dentro do contexto de fã. Conteúdo inapropriado poderá ser
              removido a qualquer momento sem aviso prévio.
            </p>
          </section>

          <div className={styles.authorCard}>
            <img src={avatar} alt="Gabriel Alves" className={styles.authorAvatar} />
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>Gabriel Alves</span>
              <span className={styles.authorHandle}>@gabbezeira</span>
              <span className={styles.authorRole}>Desenvolvedor & Criador do projeto</span>
            </div>
          </div>

          <footer className={styles.footer}>
            <span className={styles.footerText}>© 2026 Spartan Wallpapers • Projeto de fã, sem fins lucrativos.</span>
            <span className={styles.footerText}>Não oficial. Não afiliado à Microsoft Corporation.</span>
          </footer>

        </div>
      </div>
    </div>
  );
}
