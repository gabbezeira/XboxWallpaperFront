import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Scale,
  Lock,
  Image as ImageIcon,
  Mail,
  BookOpen,
  Award,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import avatar from '../../assets/avatar.jpeg';
import styles from './styles.module.scss';

export default function Terms() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          kicker="Transparência & Conformidade"
          title="Termos de Uso e Privacidade"
          subtitle="Diretrizes de utilização responsável dos recursos, proteção de dados e respeito integral à propriedade intelectual no Spartan Wallpapers."
        />

        <section className={styles.disclaimerCard}>
          <div className={styles.disclaimerIconBox}>
            <Scale size={24} />
          </div>
          <div className={styles.disclaimerBody}>
            <h2 className={styles.disclaimerTitle}>Aviso Legal e Natureza Independente</h2>
            <p className={styles.disclaimerText}>
              O <strong>Spartan Wallpapers</strong> é uma plataforma comunitária, independente, gratuita e sem fins lucrativos, criada exclusivamente por fãs para a personalização estética de consoles da família Xbox.
            </p>
            <p className={styles.disclaimerText}>
              Este projeto <strong>não possui afiliação oficial</strong>, vínculo societário, patrocínio ou chancela da <strong>Microsoft Corporation</strong>, da divisão <strong>Xbox</strong> ou de qualquer um de seus estúdios subsidiários.
            </p>
          </div>
        </section>

        <section className={styles.mainSection}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>Pilares de Operação</h2>
            <p className={styles.sectionDescription}>
              Diretrizes que regem o armazenamento, a moderação e o acesso às informações na plataforma.
            </p>
          </div>

          <div className={styles.pillarsGrid}>
            <article className={styles.pillarCard}>
              <div className={styles.pillarHeader}>
                <div className={styles.pillarIconBox}>
                  <ShieldCheck size={20} />
                </div>
                <h3 className={styles.pillarTitle}>Marcas e Propriedade Intelectual</h3>
              </div>
              <p className={styles.pillarText}>
                As marcas nominais Xbox, Xbox Series X|S, Xbox One, logotipos e identificadores visuais relacionados pertencem à Microsoft Corporation. Personagens, títulos e artes de jogos citados pertencem aos seus respectivos estúdios e publicadoras.
              </p>
              <p className={styles.pillarText}>
                A exibição de capturas e temas tem caráter estritamente artístico, informativo e de catalogação estética pessoal sem fins comerciais.
              </p>
            </article>

            <article className={styles.pillarCard}>
              <div className={styles.pillarHeader}>
                <div className={styles.pillarIconBox}>
                  <Lock size={20} />
                </div>
                <h3 className={styles.pillarTitle}>Privacidade e Dados de Conta</h3>
              </div>
              <p className={styles.pillarText}>
                A autenticação via Microsoft ou e-mail obtém somente dados públicos essenciais (nome de exibição, e-mail e foto pública) para sincronizar seu acervo, favoritos e preferências no ecossistema de nuvem.
              </p>
              <p className={styles.pillarText}>
                Não armazenamos senhas de contas externas, não solicitamos informações financeiras e não compartilhamos nem comercializamos seus dados com terceiros.
              </p>
            </article>

            <article className={styles.pillarCard}>
              <div className={styles.pillarHeader}>
                <div className={styles.pillarIconBox}>
                  <ImageIcon size={20} />
                </div>
                <h3 className={styles.pillarTitle}>Conteúdo Enviado pela Comunidade</h3>
              </div>
              <p className={styles.pillarText}>
                Ao enviar papéis de parede, o autor declara disponibilizar capturas de tela in-game legítimas, fotografias virtuais autorais ou artes de uso permitido, respeitando a legislação de direitos autorais aplicável.
              </p>
              <p className={styles.pillarText}>
                Conteúdos com teor ofensivo, material pornográfico, violência explícita gratuita ou mensagens promocionais não solicitadas são sumariamente excluídos pela moderação.
              </p>
            </article>

            <article className={styles.pillarCard}>
              <div className={styles.pillarHeader}>
                <div className={styles.pillarIconBox}>
                  <Mail size={20} />
                </div>
                <h3 className={styles.pillarTitle}>Canal de Remoção (DMCA)</h3>
              </div>
              <p className={styles.pillarText}>
                Artistas, estúdios ou titulares de direitos que identificarem obras de sua autoria compartilhadas sem prévia autorização podem solicitar despublicação ou remoção imediata por meio dos canais oficiais do projeto.
              </p>
              <p className={styles.pillarText}>
                A equipe atende a solicitações fundamentadas com máxima celeridade, atuando proativamente para preservar os direitos dos criadores originais.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.authorSection}>
          <div className={styles.authorCard}>
            <img src={avatar} alt="Gabriel Alves" className={styles.authorAvatar} />
            <div className={styles.authorInfo}>
              <div className={styles.authorTitleRow}>
                <span className={styles.authorName}>Gabriel Alves</span>
                <span className={styles.authorBadge}>Criador &amp; Mantenedor</span>
              </div>
              <p className={styles.authorBio}>
                Desenvolvido com carinho de fã para fãs, priorizando navegabilidade fluida no console, conformidade com os limites de hardware do Edge e respeito integral aos criadores de conteúdo do Xbox.
              </p>
              <div className={styles.authorLinks}>
                <a
                  href="https://x.com/Gabbezeira"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.authorLink}
                  title="Perfil no X (@Gabbezeira)"
                  tabIndex={0}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="currentColor"
                    className={styles.xIcon}
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>@Gabbezeira</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.navigationGrid}>
          <Link to="/guide" className={styles.navCard} tabIndex={0}>
            <div className={styles.navCardIconBox}>
              <BookOpen size={20} />
            </div>
            <div className={styles.navCardBody}>
              <h3 className={styles.navCardTitle}>Guia de Uso</h3>
              <p className={styles.navCardDesc}>Instruções completas para login no Xbox via QR Code e especificações</p>
            </div>
            <ArrowRight size={16} className={styles.navCardArrow} />
          </Link>

          <Link to="/levels" className={styles.navCard} tabIndex={0}>
            <div className={styles.navCardIconBox}>
              <Award size={20} />
            </div>
            <div className={styles.navCardBody}>
              <h3 className={styles.navCardTitle}>Níveis &amp; Patentes</h3>
              <p className={styles.navCardDesc}>Conheça as patentes temáticas e o desbloqueio de slots de upload</p>
            </div>
            <ArrowRight size={16} className={styles.navCardArrow} />
          </Link>
        </section>

        <footer className={styles.footer}>
          <p className={styles.footerNote}>
            © 2026 Spartan Wallpapers. Plataforma comunitária independente mantida sob diretrizes de uso leal (Fair Use).
          </p>
          <p className={styles.footerNote}>
            Xbox e Microsoft são marcas registradas da Microsoft Corporation.
          </p>
        </footer>
      </div>
    </div>
  );
}
