import { Link } from 'react-router-dom';
import {
  Smartphone,
  Laptop,
  QrCode,
  UploadCloud,
  Eye,
  EyeOff,
  Globe,
  Lock,
  ArrowRight,
  CheckCircle2,
  Gamepad2,
  Image,
  Shield,
  ScanLine,
  LogIn,
  Mail,
  Layers,
  Info,
  AlertTriangle,
} from 'lucide-react';
import styles from './styles.module.scss';

export default function Guide() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>Guia de Uso</h1>
          <p className={styles.subtitle}>
            Tudo o que você precisa saber para usar a plataforma no celular, computador ou
            diretamente no console Xbox.
          </p>
          <div className={styles.divider} />
        </header>

        <nav className={styles.tocNav}>
          <span className={styles.tocLabel}>Navegação rápida</span>
          <div className={styles.tocLinks}>
            <a href="#login" className={styles.tocLink}>Login</a>
            <a href="#upload" className={styles.tocLink}>Enviar Imagens</a>
            <a href="#visibilidade" className={styles.tocLink}>Público e Privado</a>
            <a href="#xbox" className={styles.tocLink}>Login no Xbox</a>
          </div>
        </nav>

        <section id="login" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Como Fazer Login</h2>
            <p className={styles.sectionSubtitle}>
              Acesse pelo navegador do celular ou computador. Não é necessário instalar nada.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepIconBox}>
                <Smartphone size={22} />
              </div>
              <h3 className={styles.stepTitle}>Acesse o site</h3>
              <p className={styles.stepDesc}>
                Abra o Spartan Wallpapers pelo navegador do celular ou computador.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepIconBox}>
                <LogIn size={22} />
              </div>
              <h3 className={styles.stepTitle}>Toque em Entrar</h3>
              <p className={styles.stepDesc}>
                No celular, o botão fica no menu inferior. No desktop, na barra lateral.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepIconBox}>
                <Shield size={22} />
              </div>
              <h3 className={styles.stepTitle}>Escolha o método</h3>
              <p className={styles.stepDesc}>
                Microsoft, email com senha ou QR Code. Escolha o que preferir.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>04</div>
              <div className={styles.stepIconBox}>
                <CheckCircle2 size={22} />
              </div>
              <h3 className={styles.stepTitle}>Pronto</h3>
              <p className={styles.stepDesc}>
                Com a sessão ativa, você pode favoritar, enviar e gerenciar wallpapers.
              </p>
            </div>
          </div>

          <div className={styles.methodsCard}>
            <h3 className={styles.methodsTitle}>Métodos disponíveis</h3>
            <div className={styles.methodsGrid}>
              <div className={styles.methodItem}>
                <div className={styles.methodIcon}>
                  <svg width="18" height="18" viewBox="0 0 21 21" focusable="false">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                </div>
                <div className={styles.methodInfo}>
                  <span className={styles.methodName}>Conta Microsoft</span>
                  <span className={styles.methodDesc}>
                    Importa nome e foto de perfil. Se você ainda não tem conta no Spartan Wallpapers,
                    ela é criada automaticamente ao continuar com Microsoft.
                  </span>
                </div>
              </div>
              <div className={styles.methodItem}>
                <div className={styles.methodIcon}>
                  <Mail size={18} />
                </div>
                <div className={styles.methodInfo}>
                  <span className={styles.methodName}>Email e Senha</span>
                  <span className={styles.methodDesc}>
                    Crie uma conta local com email e senha. Ideal para quem não usa conta Microsoft.
                  </span>
                </div>
              </div>
              <div className={styles.methodItem}>
                <div className={styles.methodIcon}>
                  <QrCode size={18} />
                </div>
                <div className={styles.methodInfo}>
                  <span className={styles.methodName}>QR Code</span>
                  <span className={styles.methodDesc}>
                    Escaneie pelo celular para autenticar outro dispositivo, como o console Xbox.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.tipBox}>
            <Info size={16} className={styles.tipIcon} />
            <p className={styles.tipText}>
              No celular, adicione o site à tela inicial para acessar como um app nativo.
            </p>
          </div>
        </section>

        <section id="upload" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Enviando Wallpapers</h2>
            <p className={styles.sectionSubtitle}>
              Suba imagens em alta resolução para usar no console ou compartilhar com a comunidade.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepIconBox}>
                <LogIn size={22} />
              </div>
              <h3 className={styles.stepTitle}>Faça login</h3>
              <p className={styles.stepDesc}>
                O envio de wallpapers requer uma conta ativa na plataforma.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepIconBox}>
                <UploadCloud size={22} />
              </div>
              <h3 className={styles.stepTitle}>Aba Enviar</h3>
              <p className={styles.stepDesc}>
                Acesse pelo menu e arraste as imagens ou selecione do dispositivo.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepIconBox}>
                <Image size={22} />
              </div>
              <h3 className={styles.stepTitle}>Resolução alta</h3>
              <p className={styles.stepDesc}>
                JPG, PNG ou WebP. Proporção 16:9. Mínimo 1920×1080, ideal 3840×2160.
              </p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>04</div>
              <div className={styles.stepIconBox}>
                <CheckCircle2 size={22} />
              </div>
              <h3 className={styles.stepTitle}>Salvo</h3>
              <p className={styles.stepDesc}>
                A imagem vai para Meus Wallpapers como privada. Só você a vê até torná-la pública.
              </p>
            </div>
          </div>

          <div className={styles.specsRow}>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Formatos</span>
              <span className={styles.specValue}>JPG, PNG, WebP</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Proporção</span>
              <span className={styles.specValue}>16:9</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Mínimo</span>
              <span className={styles.specValue}>1920×1080</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>Ideal</span>
              <span className={styles.specValue}>3840×2160</span>
            </div>
          </div>
        </section>

        <section id="visibilidade" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Público e Privado</h2>
            <p className={styles.sectionSubtitle}>
              Todo wallpaper começa como privado. Você decide quando e se quer compartilhar
              com a comunidade.
            </p>
          </div>

          <div className={styles.visibilityGrid}>
            <div className={`${styles.visibilityCard} ${styles.privateCard}`}>
              <div className={styles.visibilityHeader}>
                <div className={styles.visibilityIconBox}>
                  <Lock size={24} />
                </div>
                <div className={styles.visibilityBadge}>
                  <EyeOff size={11} />
                  <span>PRIVADO</span>
                </div>
              </div>
              <h3 className={styles.visibilityTitle}>Só você vê</h3>
              <p className={styles.visibilityDesc}>
                Visível apenas em Meus Wallpapers. Pode ser aplicado no console normalmente,
                sem moderação.
              </p>
              <ul className={styles.visibilityList}>
                <li><CheckCircle2 size={13} /><span>Estado padrão de todo upload</span></li>
                <li><CheckCircle2 size={13} /><span>Sem fila de moderação</span></li>
                <li><CheckCircle2 size={13} /><span>Pode ser tornado público a qualquer momento</span></li>
              </ul>
            </div>

            <div className={`${styles.visibilityCard} ${styles.publicCard}`}>
              <div className={styles.visibilityHeader}>
                <div className={`${styles.visibilityIconBox} ${styles.publicIconBox}`}>
                  <Globe size={24} />
                </div>
                <div className={`${styles.visibilityBadge} ${styles.publicBadge}`}>
                  <Eye size={11} />
                  <span>PÚBLICO</span>
                </div>
              </div>
              <h3 className={styles.visibilityTitle}>Visível para todos</h3>
              <p className={styles.visibilityDesc}>
                Aparece na galeria pública. Outros jogadores podem favoritar e usar no console
                deles. Favoritos contam para sua patente.
              </p>
              <ul className={styles.visibilityList}>
                <li><CheckCircle2 size={13} /><span>Passa por moderação antes de aparecer</span></li>
                <li><CheckCircle2 size={13} /><span>Favoritos recebidos contam para a patente</span></li>
                <li><CheckCircle2 size={13} /><span>Pode ser revertido para privado</span></li>
              </ul>
            </div>
          </div>

          <div className={styles.flowCard}>
            <span className={styles.flowLabel}>Fluxo de publicação</span>
            <div className={styles.flowSteps}>
              <div className={styles.flowStep}>
                <div className={styles.flowIcon}><UploadCloud size={16} /></div>
                <span className={styles.flowText}>Upload</span>
              </div>
              <ArrowRight size={14} className={styles.flowArrow} />
              <div className={styles.flowStep}>
                <div className={styles.flowIcon}><Lock size={16} /></div>
                <span className={styles.flowText}>Privado</span>
              </div>
              <ArrowRight size={14} className={styles.flowArrow} />
              <div className={styles.flowStep}>
                <div className={styles.flowIcon}><Eye size={16} /></div>
                <span className={styles.flowText}>Solicitar</span>
              </div>
              <ArrowRight size={14} className={styles.flowArrow} />
              <div className={styles.flowStep}>
                <div className={styles.flowIcon}><Shield size={16} /></div>
                <span className={styles.flowText}>Moderação</span>
              </div>
              <ArrowRight size={14} className={styles.flowArrow} />
              <div className={styles.flowStep}>
                <div className={`${styles.flowIcon} ${styles.flowIconApproved}`}><Globe size={16} /></div>
                <span className={styles.flowText}>Galeria</span>
              </div>
            </div>
          </div>
        </section>

        <section id="xbox" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Login no Xbox via QR Code</h2>
            <p className={styles.sectionSubtitle}>
              O navegador Edge do console Xbox possui um limite severo de memória RAM, o que impede
              o carregamento do sistema de login da Microsoft diretamente na tela do console.
              Para contornar isso, o Spartan Wallpapers usa um sistema de QR Code: você escaneia
              pelo celular, faz login pelo método que preferir e o console é autorizado
              automaticamente.
            </p>
          </div>

          <div className={styles.warningBox}>
            <AlertTriangle size={16} className={styles.warningIcon} />
            <p className={styles.warningText}>
              O login por Microsoft ou Email não funciona diretamente no Edge do Xbox devido ao
              limite de RAM do navegador do console. O QR Code é o único método disponível no Xbox.
            </p>
          </div>

          <div className={styles.timelineGrid}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}>
                <Gamepad2 size={16} />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>Abra o site no Xbox</h3>
                <p className={styles.timelineDesc}>
                  No console, abra o Microsoft Edge e acesse o Spartan Wallpapers. O sistema
                  detecta automaticamente que é um Xbox.
                </p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}>
                <QrCode size={16} />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>QR Code na tela</h3>
                <p className={styles.timelineDesc}>
                  Um QR Code e um código alfanumérico (ex: XB-A1B2) aparecem na tela do console.
                  O código expira em 5 minutos.
                </p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}>
                <ScanLine size={16} />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>Escaneie pelo celular</h3>
                <p className={styles.timelineDesc}>
                  Use a câmera do smartphone para ler o QR Code. Você será direcionado para a
                  página de autorização com o código já preenchido.
                </p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot}>
                <LogIn size={16} />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>Faça login no celular</h3>
                <p className={styles.timelineDesc}>
                  Na página aberta pelo QR Code, entre com Microsoft, email ou qualquer método
                  disponível. Se não tiver conta, ao continuar com Microsoft ela será criada
                  automaticamente.
                </p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineDot} ${styles.timelineDotDone}`}>
                <CheckCircle2 size={16} />
              </div>
              <div className={styles.timelineContent}>
                <h3 className={styles.timelineTitle}>Console autorizado</h3>
                <p className={styles.timelineDesc}>
                  Após autorizar, o Xbox recebe o login em poucos segundos. A partir daí, você
                  navega logado no console normalmente.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.tipBox}>
            <Info size={16} className={styles.tipIcon} />
            <p className={styles.tipText}>
              Se o código expirar, clique em "Gerar novo código" no console e repita o processo.
            </p>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Pronto para começar?</h2>
          <p className={styles.ctaDesc}>
            Explore a galeria da comunidade ou envie seus primeiros wallpapers.
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/gallery" className={styles.btnPrimary} tabIndex={0}>
              Explorar Galeria
              <ArrowRight size={18} />
            </Link>
            <Link to="/upload" className={styles.btnSecondary} tabIndex={0}>
              <UploadCloud size={18} />
              Enviar Wallpaper
            </Link>
            <Link to="/levels" className={styles.btnGhost} tabIndex={0}>
              Níveis &amp; Badges
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
