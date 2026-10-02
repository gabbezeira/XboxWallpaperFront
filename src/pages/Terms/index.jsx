import { Link } from 'react-router-dom';
import { ShieldCheck, Scale, Lock, Image as ImageIcon, Mail, BookOpen, Award } from 'lucide-react';
import avatar from '../../assets/avatar.jpeg';
import styles from './styles.module.scss';

export default function Terms() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headerBadge}>
            <ShieldCheck size={16} />
            <span>Transparência &amp; Diretrizes da Comunidade</span>
          </div>
          <h1 className={styles.title}>Termos de Uso e Privacidade</h1>
          <p className={styles.subtitle}>
            Diretrizes legais, uso responsável dos recursos e compromisso com a privacidade dos membros da comunidade Spartan Wallpapers.
          </p>
          <div className={styles.divider} />
        </header>

        <div className={styles.content}>
          <section className={styles.cardPrimary}>
            <div className={styles.cardIconBox}>
              <Scale size={24} />
            </div>
            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>Aviso Legal e Natureza do Projeto</h2>
              <p className={styles.cardText}>
                O <strong>Spartan Wallpapers</strong> é uma plataforma independente, gratuita e sem fins lucrativos, desenvolvida por entusiastas para a personalização de consoles da família Xbox.
              </p>
              <p className={styles.cardText}>
                Este serviço <strong>não possui vínculo oficial</strong>, afiliação, autorização, patrocínio ou endosso da <strong>Microsoft Corporation</strong>, da divisão <strong>Xbox</strong> ou de qualquer uma de suas subsidiárias.
              </p>
            </div>
          </section>

          <div className={styles.sectionsGrid}>
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <ShieldCheck size={20} />
                </div>
                <h2 className={styles.sectionTitle}>Marcas Registradas e Direitos</h2>
              </div>
              <p className={styles.sectionText}>
                Os termos Xbox, Xbox Game Studios, marcas registradas, logotipos e identificadores visuais relacionados pertencem à Microsoft Corporation. Todas as franquias, personagens e materiais promocionais referenciados pertencem aos seus respectivos estúdios e publicadoras.
              </p>
              <p className={styles.sectionText}>
                A exibição nesta plataforma tem caráter estritamente referencial e de catalogação estética sem qualquer intuito comercial.
              </p>
            </section>

            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <Lock size={20} />
                </div>
                <h2 className={styles.sectionTitle}>Privacidade e Dados de Conta</h2>
              </div>
              <p className={styles.sectionText}>
                A autenticação via conta Microsoft ou e-mail obtém somente dados públicos essenciais (nome de exibição, e-mail e foto de perfil) para sincronizar seus favoritos, coleções e uploads na nuvem.
              </p>
              <p className={styles.sectionText}>
                Não armazenamos senhas de contas externas, não solicitamos dados financeiros e não compartilhamos registros com terceiros.
              </p>
            </section>

            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <ImageIcon size={20} />
                </div>
                <h2 className={styles.sectionTitle}>Conteúdo Enviado pela Comunidade</h2>
              </div>
              <p className={styles.sectionText}>
                Ao enviar papéis de parede para a plataforma, o usuário se compromete a disponibilizar capturas de tela legítimas, fan arts autorizadas ou materiais de domínio público sem violar direitos autorais de terceiros.
              </p>
              <p className={styles.sectionText}>
                Envios com teor ofensivo, conteúdo adulto explícito, violência desmedida ou publicidade não solicitada serão sumariamente removidos.
              </p>
            </section>

            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <Mail size={20} />
                </div>
                <h2 className={styles.sectionTitle}>Moderação e Remoção (DMCA)</h2>
              </div>
              <p className={styles.sectionText}>
                Detentores de direitos autorais ou artistas que identificarem obras suas publicadas sem autorização podem solicitar a despublicação ou exclusão imediata entrando em contato pelos canais do projeto.
              </p>
              <p className={styles.sectionText}>
                A equipe atende a pedidos fundamentados com prioridade máxima e sem necessidade de litígio formal.
              </p>
            </section>
          </div>

          <div className={styles.authorCard}>
            <img src={avatar} alt="Gabriel Alves" className={styles.authorAvatar} />
            <div className={styles.authorInfo}>
              <div className={styles.authorNameRow}>
                <span className={styles.authorName}>Gabriel Alves</span>
                <span className={styles.authorTag}>Criador &amp; Mantenedor</span>
              </div>
              <p className={styles.authorBio}>
                Desenvolvido de fã para fãs com foco em máxima compatibilidade técnica, navegabilidade fluida no console e respeito à comunidade.
              </p>
              <div className={styles.authorLinks}>
                <a
                  href="https://x.com/Gabbezeira"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.authorSocialLink}
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

          <div className={styles.navCards}>
            <Link to="/guide" className={styles.navCard} tabIndex={0}>
              <div className={styles.navCardIcon}>
                <BookOpen size={20} />
              </div>
              <div className={styles.navCardContent}>
                <span className={styles.navCardTitle}>Guia de Uso</span>
                <span className={styles.navCardDesc}>Passo a passo completo de login no Xbox e envio</span>
              </div>
            </Link>

            <Link to="/levels" className={styles.navCard} tabIndex={0}>
              <div className={styles.navCardIcon}>
                <Award size={20} />
              </div>
              <div className={styles.navCardContent}>
                <span className={styles.navCardTitle}>Níveis &amp; Badges</span>
                <span className={styles.navCardDesc}>Conheça as patentes e como desbloquear cotas de upload</span>
              </div>
            </Link>
          </div>

          <footer className={styles.footer}>
            <p className={styles.footerText}>
              © 2026 Spartan Wallpapers. Plataforma comunitária independente mantida sob diretrizes de uso leal (Fair Use).
            </p>
            <p className={styles.footerText}>
              Xbox e Microsoft são marcas registradas da Microsoft Corporation.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
