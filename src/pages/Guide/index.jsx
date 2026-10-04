import { Link } from 'react-router-dom';
import {
  Smartphone,
  QrCode,
  UploadCloud,
  Globe,
  Lock,
  ArrowRight,
  Check,
  Gamepad2,
  Image,
  Shield,
  Mail,
  Layers,
  AlertTriangle,
  Monitor,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import styles from './styles.module.scss';

export default function Guide() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          kicker="Central de Ajuda"
          title="Guia de Uso"
          subtitle="Aprenda a utilizar o Spartan Wallpapers no celular, computador ou diretamente no navegador do seu console Xbox com sincronização em tempo real."
          action={
            <Link to="/upload" className={styles.btnHeaderAction} tabIndex={0}>
              <UploadCloud size={16} />
              <span>Enviar Wallpaper</span>
            </Link>
          }
        />

        <nav className={styles.tocNav}>
          <span className={styles.tocLabel}>Navegação rápida:</span>
          <div className={styles.tocLinks}>
            <a href="#autenticacao" className={styles.tocLink} tabIndex={0}>Autenticação</a>
            <a href="#especificacoes" className={styles.tocLink} tabIndex={0}>Formatos e Resolução</a>
            <a href="#visibilidade" className={styles.tocLink} tabIndex={0}>Modos de Visibilidade</a>
            <a href="#xbox" className={styles.tocLink} tabIndex={0}>Conexão no Xbox</a>
          </div>
        </nav>

        <section id="autenticacao" className={styles.mainSection}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>Como Fazer Login</h2>
            <p className={styles.sectionDescription}>
              Acesse pelo celular, tablet ou computador. Não é necessário instalar aplicativos adicionais.
            </p>
          </div>

          <div className={styles.methodsGrid}>
            <div className={styles.methodCard}>
              <div className={styles.methodHeader}>
                <div className={styles.methodIconBox}>
                  <svg width="20" height="20" viewBox="0 0 21 21" focusable="false" aria-hidden="true">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                </div>
                <h3 className={styles.methodTitle}>Conta Microsoft</h3>
              </div>
              <p className={styles.methodText}>
                Importa automaticamente seu nome e imagem de perfil da Xbox Live. Caso seja seu primeiro acesso, sua conta comunitária é criada instantaneamente.
              </p>
              <div className={styles.methodFooter}>
                <Check size={14} className={styles.footerCheck} />
                <span>Recomendado para integração com Xbox</span>
              </div>
            </div>

            <div className={styles.methodCard}>
              <div className={styles.methodHeader}>
                <div className={styles.methodIconBox}>
                  <Mail size={20} />
                </div>
                <h3 className={styles.methodTitle}>E-mail e Senha</h3>
              </div>
              <p className={styles.methodText}>
                Permite autenticação com qualquer endereço de e-mail válido. Ideal para criadores que preferem utilizar credenciais dedicadas para a plataforma.
              </p>
              <div className={styles.methodFooter}>
                <Check size={14} className={styles.footerCheck} />
                <span>Independente de contas corporativas</span>
              </div>
            </div>

            <div className={styles.methodCard}>
              <div className={styles.methodHeader}>
                <div className={styles.methodIconBox}>
                  <QrCode size={20} />
                </div>
                <h3 className={styles.methodTitle}>Acesso via QR Code</h3>
              </div>
              <p className={styles.methodText}>
                Escaneie o código exibido na TV pelo celular para vincular a sessão ao navegador Edge do Xbox sem precisar digitar dados no controle.
              </p>
              <div className={styles.methodFooter}>
                <Check size={14} className={styles.footerCheck} />
                <span>Agilidade total no console</span>
              </div>
            </div>
          </div>
        </section>

        <section id="especificacoes" className={styles.mainSection}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>Padrões Técnicos de Envio</h2>
            <p className={styles.sectionDescription}>
              Diretrizes de resolução e enquadramento para garantir a melhor nitidez na dashboard do seu Xbox.
            </p>
          </div>

          <div className={styles.specsGrid}>
            <div className={styles.specCard}>
              <span className={styles.specLabel}>Proporção Nativa</span>
              <span className={styles.specHighlight}>16:9 Widescreen</span>
              <span className={styles.specDetail}>Enquadramento ideal sem barras pretas ou cortes laterais</span>
            </div>

            <div className={styles.specCard}>
              <span className={styles.specLabel}>Resoluções Suportadas</span>
              <span className={styles.specHighlight}>1080p, 1440p e 4K</span>
              <span className={styles.specDetail}>Mínimo de 1920×1080 até 3840×2160 em altíssima fidelidade</span>
            </div>

            <div className={styles.specCard}>
              <span className={styles.specLabel}>Formatos de Arquivo</span>
              <span className={styles.specHighlight}>WebP, JPG e PNG</span>
              <span className={styles.specDetail}>Compressão otimizada sem artefatos visuais ou ruído térmico</span>
            </div>

            <div className={styles.specCard}>
              <span className={styles.specLabel}>Diretriz de Arte</span>
              <span className={styles.specHighlight}>Composição Limpa</span>
              <span className={styles.specDetail}>Sem marcas d&apos;água intrusivas ou textos que poluam os blocos do console</span>
            </div>
          </div>
        </section>

        <section id="visibilidade" className={styles.mainSection}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>Modos de Visibilidade</h2>
            <p className={styles.sectionDescription}>
              Você tem total autonomia sobre como suas capturas são distribuídas na rede.
            </p>
          </div>

          <div className={styles.visibilityGrid}>
            <div className={styles.visibilityCard}>
              <div className={styles.visibilityCardTop}>
                <div className={styles.visibilityIconBox}>
                  <Lock size={22} />
                </div>
                <span className={styles.visibilityBadgePrivate}>Privado</span>
              </div>
              <h3 className={styles.visibilityCardTitle}>Acervo Pessoal</h3>
              <p className={styles.visibilityCardText}>
                Todo upload ingressa inicialmente no seu acervo pessoal. Apenas você consegue visualizá-lo em Meus Wallpapers e aplicá-lo nos seus consoles vinculados sem passar por moderação.
              </p>
              <ul className={styles.perksList}>
                <li className={styles.perkItem}>
                  <Check size={14} className={styles.perkIcon} />
                  <span>Disponível imediatamente após o envio</span>
                </li>
                <li className={styles.perkItem}>
                  <Check size={14} className={styles.perkIcon} />
                  <span>Não consome cota de moderação pública</span>
                </li>
                <li className={styles.perkItem}>
                  <Check size={14} className={styles.perkIcon} />
                  <span>Pode ser enviado para a galeria a qualquer momento</span>
                </li>
              </ul>
            </div>

            <div className={styles.visibilityCard}>
              <div className={styles.visibilityCardTop}>
                <div className={styles.visibilityIconBox}>
                  <Globe size={22} />
                </div>
                <span className={styles.visibilityBadgePublic}>Público</span>
              </div>
              <h3 className={styles.visibilityCardTitle}>Galeria da Comunidade</h3>
              <p className={styles.visibilityCardText}>
                Ao solicitar publicação, o wallpaper passa por uma rápida revisão de qualidade pela equipe. Após aprovação, ele fica disponível para milhares de jogadores e os favoritos recebidos elevam sua patente.
              </p>
              <ul className={styles.perksList}>
                <li className={styles.perkItem}>
                  <Check size={14} className={styles.perkIcon} />
                  <span>Exibição no catálogo aberto e busca por jogos</span>
                </li>
                <li className={styles.perkItem}>
                  <Check size={14} className={styles.perkIcon} />
                  <span>Favoritos recebidos somam pontos para sua patente</span>
                </li>
                <li className={styles.perkItem}>
                  <Check size={14} className={styles.perkIcon} />
                  <span>Pode ser revertido para privado quando desejar</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.flowCard}>
            <span className={styles.flowCardLabel}>Ciclo de Vida do Wallpaper</span>
            <div className={styles.flowSteps}>
              <div className={styles.flowStep}>
                <div className={styles.flowStepIcon}><UploadCloud size={16} /></div>
                <span className={styles.flowStepName}>1. Upload</span>
                <span className={styles.flowStepSub}>Envio do arquivo</span>
              </div>
              <ArrowRight size={16} className={styles.flowDivider} />
              <div className={styles.flowStep}>
                <div className={styles.flowStepIcon}><Lock size={16} /></div>
                <span className={styles.flowStepName}>2. Privado</span>
                <span className={styles.flowStepSub}>Uso pessoal imediato</span>
              </div>
              <ArrowRight size={16} className={styles.flowDivider} />
              <div className={styles.flowStep}>
                <div className={styles.flowStepIcon}><Shield size={16} /></div>
                <span className={styles.flowStepName}>3. Moderação</span>
                <span className={styles.flowStepSub}>Curadoria técnica</span>
              </div>
              <ArrowRight size={16} className={styles.flowDivider} />
              <div className={styles.flowStep}>
                <div className={styles.flowStepIcon}><Globe size={16} /></div>
                <span className={styles.flowStepName}>4. Galeria</span>
                <span className={styles.flowStepSub}>Pontua no ranking</span>
              </div>
            </div>
          </div>
        </section>

        <section id="xbox" className={styles.mainSection}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>Conexão Direta no Xbox</h2>
            <p className={styles.sectionDescription}>
              O sistema foi desenhado para contornar limitações de memória do Microsoft Edge no console, tornando o login prático e veloz.
            </p>
          </div>

          <div className={styles.xboxStepsGrid}>
            <div className={styles.xboxStepCard}>
              <div className={styles.xboxStepHeader}>
                <Gamepad2 size={20} className={styles.xboxStepIcon} />
                <span className={styles.xboxStepNumber}>Passo 01</span>
              </div>
              <h3 className={styles.xboxStepTitle}>Abra no Edge do Xbox</h3>
              <p className={styles.xboxStepText}>
                No seu console, abra o Microsoft Edge e acesse o Spartan Wallpapers. O sistema detecta automaticamente o console.
              </p>
            </div>

            <div className={styles.xboxStepCard}>
              <div className={styles.xboxStepHeader}>
                <QrCode size={20} className={styles.xboxStepIcon} />
                <span className={styles.xboxStepNumber}>Passo 02</span>
              </div>
              <h3 className={styles.xboxStepTitle}>Escaneie o QR Code</h3>
              <p className={styles.xboxStepText}>
                Aponte a câmera do celular para o código na TV ou digite o código alfanumérico na tela de vinculação.
              </p>
            </div>

            <div className={styles.xboxStepCard}>
              <div className={styles.xboxStepHeader}>
                <Smartphone size={20} className={styles.xboxStepIcon} />
                <span className={styles.xboxStepNumber}>Passo 03</span>
              </div>
              <h3 className={styles.xboxStepTitle}>Confirme no Smartphone</h3>
              <p className={styles.xboxStepText}>
                Autorize com sua conta Microsoft ou e-mail. A sessão é transmitida ao console em segundos sem precisar de teclado físico.
              </p>
            </div>
          </div>

          <div className={styles.infoAlert}>
            <AlertTriangle size={18} className={styles.infoAlertIcon} />
            <p className={styles.infoAlertText}>
              Devido à gestão de memória do navegador do console, realizar login digitando senhas no Edge pode congelar a aba. O fluxo via QR Code foi desenvolvido especialmente para garantir estabilidade máxima.
            </p>
          </div>
        </section>

        <section className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Pronto para explorar o acervo?</h2>
            <p className={styles.ctaText}>
              Confira os papéis de parede em destaque ou envie suas capturas autorais para subir no sistema de patentes.
            </p>
          </div>
          <div className={styles.ctaButtons}>
            <Link to="/gallery" className={styles.btnPrimary} tabIndex={0}>
              <span>Explorar Galeria</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/levels" className={styles.btnSecondary} tabIndex={0}>
              <span>Níveis &amp; Patentes</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
