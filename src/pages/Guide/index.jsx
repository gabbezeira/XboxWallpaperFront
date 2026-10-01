import { Link } from 'react-router-dom';
import {
  BookOpen,
  Smartphone,
  Monitor,
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
} from 'lucide-react';
import styles from './styles.module.scss';

const LOGIN_STEPS_MOBILE = [
  {
    number: '01',
    icon: Smartphone,
    title: 'Abra o Site no Celular',
    desc: 'Acesse o Spartan Wallpapers pelo navegador do seu smartphone (Chrome, Safari ou qualquer outro).',
  },
  {
    number: '02',
    icon: LogIn,
    title: 'Toque em "Entrar"',
    desc: 'Na barra lateral ou no menu inferior, toque no botão Entrar para abrir o painel de autenticação.',
  },
  {
    number: '03',
    icon: Shield,
    title: 'Escolha Seu Método',
    desc: 'Você pode entrar com sua conta Microsoft, criar uma conta com email e senha, ou usar o QR Code.',
  },
  {
    number: '04',
    icon: CheckCircle2,
    title: 'Pronto!',
    desc: 'Após o login, você tem acesso completo: favoritar, enviar wallpapers e gerenciar suas imagens.',
  },
];

const LOGIN_STEPS_DESKTOP = [
  {
    number: '01',
    icon: Laptop,
    title: 'Acesse pelo Navegador',
    desc: 'Abra o site no computador usando Chrome, Edge, Firefox ou qualquer navegador moderno.',
  },
  {
    number: '02',
    icon: LogIn,
    title: 'Clique em "Entrar"',
    desc: 'O botão de login fica na barra lateral esquerda, no rodapé da navegação principal.',
  },
  {
    number: '03',
    icon: Shield,
    title: 'Autentique-se',
    desc: 'Escolha entre Microsoft, Email ou QR Code. O login com Microsoft importa automaticamente seu nome e foto de perfil.',
  },
  {
    number: '04',
    icon: CheckCircle2,
    title: 'Navegue e Crie',
    desc: 'Com a sessão ativa, todas as funcionalidades ficam disponíveis: upload, favoritos, coleções e mais.',
  },
];

const UPLOAD_STEPS = [
  {
    number: '01',
    icon: LogIn,
    title: 'Faça Login',
    desc: 'Você precisa estar autenticado para enviar wallpapers. Entre pelo celular, desktop ou Xbox.',
  },
  {
    number: '02',
    icon: UploadCloud,
    title: 'Acesse a Aba "Enviar"',
    desc: 'No menu lateral ou inferior, clique em Enviar. Você verá a zona de upload e sua barra de cota disponível.',
  },
  {
    number: '03',
    icon: Image,
    title: 'Selecione Suas Imagens',
    desc: 'Arraste arquivos para a zona de upload ou clique para selecionar. Formatos aceitos: JPG, PNG e WebP em alta resolução (1080p, 2K ou 4K).',
  },
  {
    number: '04',
    icon: CheckCircle2,
    title: 'Envio Concluído',
    desc: 'As imagens ficam salvas na aba "Meus Wallpapers". Por padrão, elas começam como privadas — visíveis apenas para você.',
  },
];

const XBOX_QR_STEPS = [
  {
    number: '01',
    icon: Gamepad2,
    title: 'Abra o Site no Xbox',
    desc: 'No seu console Xbox, abra o navegador Microsoft Edge e acesse o site do Spartan Wallpapers.',
  },
  {
    number: '02',
    icon: QrCode,
    title: 'QR Code Aparece Automaticamente',
    desc: 'Como o console não suporta login tradicional facilmente, o sistema detecta o Xbox e exibe um QR Code com um código alfanumérico.',
  },
  {
    number: '03',
    icon: ScanLine,
    title: 'Escaneie com o Celular',
    desc: 'Use a câmera do seu smartphone para escanear o QR Code. Você será redirecionado para a página de autorização.',
  },
  {
    number: '04',
    icon: LogIn,
    title: 'Faça Login no Celular',
    desc: 'Na página aberta pelo QR Code, entre com sua conta (Microsoft ou Email). O código do console é preenchido automaticamente.',
  },
  {
    number: '05',
    icon: CheckCircle2,
    title: 'Console Autorizado',
    desc: 'Após autorizar, o Xbox recebe o login automaticamente em poucos segundos. Você já pode navegar logado no console.',
  },
];

export default function Guide() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headerBadge}>
            <BookOpen size={16} />
            <span>Guia do Usuário</span>
          </div>
          <h1 className={styles.title}>Como Usar o Spartan Wallpapers</h1>
          <p className={styles.subtitle}>
            Um guia completo para aproveitar todos os recursos da plataforma: login em diferentes
            dispositivos, envio de imagens, sistema de visibilidade e autenticação no Xbox.
          </p>
          <div className={styles.divider} />
        </header>

        <nav className={styles.tocNav}>
          <span className={styles.tocLabel}>Ir para:</span>
          <div className={styles.tocLinks}>
            <a href="#login-celular" className={styles.tocLink}>
              <Smartphone size={14} />
              Login no Celular
            </a>
            <a href="#login-desktop" className={styles.tocLink}>
              <Laptop size={14} />
              Login no Desktop
            </a>
            <a href="#upload" className={styles.tocLink}>
              <UploadCloud size={14} />
              Enviar Imagens
            </a>
            <a href="#visibilidade" className={styles.tocLink}>
              <Eye size={14} />
              Público e Privado
            </a>
            <a href="#xbox-qrcode" className={styles.tocLink}>
              <Gamepad2 size={14} />
              Login no Xbox
            </a>
          </div>
        </nav>

        <section id="login-celular" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>
              <Smartphone size={14} />
              <span>Dispositivo Móvel</span>
            </div>
            <h2 className={styles.sectionTitle}>Login pelo Celular</h2>
            <p className={styles.sectionSubtitle}>
              Acesse sua conta diretamente pelo navegador do smartphone, sem precisar instalar
              nenhum aplicativo.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {LOGIN_STEPS_MOBILE.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{step.number}</div>
                  <div className={styles.stepIconBox}>
                    <StepIcon size={24} />
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div className={styles.tipBox}>
            <Info size={18} className={styles.tipIcon} />
            <p className={styles.tipText}>
              <strong>Dica:</strong> Adicione o site à tela inicial do seu celular para um acesso
              rápido, como se fosse um aplicativo nativo.
            </p>
          </div>
        </section>

        <section id="login-desktop" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>
              <Laptop size={14} />
              <span>Computador</span>
            </div>
            <h2 className={styles.sectionTitle}>Login pelo Desktop</h2>
            <p className={styles.sectionSubtitle}>
              A experiência completa no computador, com navegação pela barra lateral e suporte a
              teclado e gamepad.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {LOGIN_STEPS_DESKTOP.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{step.number}</div>
                  <div className={styles.stepIconBox}>
                    <StepIcon size={24} />
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div className={styles.authMethodsCard}>
            <h3 className={styles.authMethodsTitle}>Métodos de Login Disponíveis</h3>
            <div className={styles.authMethodsGrid}>
              <div className={styles.authMethodItem}>
                <div className={styles.authMethodIcon}>
                  <svg width="20" height="20" viewBox="0 0 21 21" focusable="false">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                </div>
                <div className={styles.authMethodInfo}>
                  <span className={styles.authMethodName}>Microsoft</span>
                  <span className={styles.authMethodDesc}>
                    Importa nome e foto do perfil automaticamente
                  </span>
                </div>
              </div>
              <div className={styles.authMethodItem}>
                <div className={styles.authMethodIcon}>
                  <Mail size={20} />
                </div>
                <div className={styles.authMethodInfo}>
                  <span className={styles.authMethodName}>Email e Senha</span>
                  <span className={styles.authMethodDesc}>
                    Crie uma conta local com email e senha de sua escolha
                  </span>
                </div>
              </div>
              <div className={styles.authMethodItem}>
                <div className={styles.authMethodIcon}>
                  <QrCode size={20} />
                </div>
                <div className={styles.authMethodInfo}>
                  <span className={styles.authMethodName}>QR Code</span>
                  <span className={styles.authMethodDesc}>
                    Ideal para TVs e consoles — escaneie pelo celular
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="upload" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>
              <UploadCloud size={14} />
              <span>Envio de Imagens</span>
            </div>
            <h2 className={styles.sectionTitle}>Como Enviar Wallpapers</h2>
            <p className={styles.sectionSubtitle}>
              Suba suas capturas de tela, artes e papéis de parede em alta resolução para usar no
              seu console Xbox ou compartilhar com a comunidade.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {UPLOAD_STEPS.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{step.number}</div>
                  <div className={styles.stepIconBox}>
                    <StepIcon size={24} />
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div className={styles.specsCard}>
            <h3 className={styles.specsTitle}>Especificações Recomendadas</h3>
            <div className={styles.specsGrid}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Formatos</span>
                <span className={styles.specValue}>JPG, PNG, WebP</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Proporção Ideal</span>
                <span className={styles.specValue}>16:9 (widescreen)</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Resolução Mínima</span>
                <span className={styles.specValue}>1920×1080 (Full HD)</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Resolução Ideal</span>
                <span className={styles.specValue}>3840×2160 (4K UHD)</span>
              </div>
            </div>
          </div>
        </section>

        <section id="visibilidade" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionBadge}>
              <Eye size={14} />
              <span>Visibilidade</span>
            </div>
            <h2 className={styles.sectionTitle}>Sistema de Público e Privado</h2>
            <p className={styles.sectionSubtitle}>
              Entenda como funciona a visibilidade dos seus wallpapers e o processo de moderação
              para publicação na galeria comunitária.
            </p>
          </div>

          <div className={styles.visibilityGrid}>
            <div className={`${styles.visibilityCard} ${styles.privateCard}`}>
              <div className={styles.visibilityCardHeader}>
                <div className={styles.visibilityIconBox}>
                  <Lock size={28} />
                </div>
                <div className={styles.visibilityBadge}>
                  <EyeOff size={12} />
                  <span>PRIVADO</span>
                </div>
              </div>
              <h3 className={styles.visibilityCardTitle}>Wallpaper Privado</h3>
              <p className={styles.visibilityCardDesc}>
                Visível <strong>apenas para você</strong> na aba "Meus Wallpapers". Outros
                usuários não conseguem ver, buscar ou acessar a imagem.
              </p>
              <ul className={styles.visibilityList}>
                <li>
                  <CheckCircle2 size={14} />
                  <span>Estado padrão de todo upload novo</span>
                </li>
                <li>
                  <CheckCircle2 size={14} />
                  <span>Pode ser aplicado direto no seu console Xbox</span>
                </li>
                <li>
                  <CheckCircle2 size={14} />
                  <span>Sem necessidade de moderação</span>
                </li>
                <li>
                  <CheckCircle2 size={14} />
                  <span>Você pode torná-lo público a qualquer momento</span>
                </li>
              </ul>
            </div>

            <div className={`${styles.visibilityCard} ${styles.publicCard}`}>
              <div className={styles.visibilityCardHeader}>
                <div className={styles.visibilityIconBox}>
                  <Globe size={28} />
                </div>
                <div className={`${styles.visibilityBadge} ${styles.publicBadge}`}>
                  <Eye size={12} />
                  <span>PÚBLICO</span>
                </div>
              </div>
              <h3 className={styles.visibilityCardTitle}>Wallpaper Público</h3>
              <p className={styles.visibilityCardDesc}>
                Visível para <strong>toda a comunidade</strong> na galeria pública. Outros
                jogadores podem favoritar e aplicar no console deles.
              </p>
              <ul className={styles.visibilityList}>
                <li>
                  <CheckCircle2 size={14} />
                  <span>Passa por moderação antes de aparecer</span>
                </li>
                <li>
                  <CheckCircle2 size={14} />
                  <span>Favoritos recebidos contam para sua patente</span>
                </li>
                <li>
                  <CheckCircle2 size={14} />
                  <span>Aparece na galeria, buscas e coleções</span>
                </li>
                <li>
                  <CheckCircle2 size={14} />
                  <span>Pode ser revertido para privado quando quiser</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.flowCard}>
            <h3 className={styles.flowTitle}>Fluxo de Publicação</h3>
            <div className={styles.flowSteps}>
              <div className={styles.flowStep}>
                <div className={styles.flowStepIcon}>
                  <UploadCloud size={18} />
                </div>
                <span className={styles.flowStepLabel}>Upload</span>
                <span className={styles.flowStepSub}>Imagem enviada</span>
              </div>
              <div className={styles.flowArrow}>
                <ArrowRight size={16} />
              </div>
              <div className={styles.flowStep}>
                <div className={styles.flowStepIcon}>
                  <Lock size={18} />
                </div>
                <span className={styles.flowStepLabel}>Privado</span>
                <span className={styles.flowStepSub}>Só você vê</span>
              </div>
              <div className={styles.flowArrow}>
                <ArrowRight size={16} />
              </div>
              <div className={styles.flowStep}>
                <div className={styles.flowStepIcon}>
                  <Eye size={18} />
                </div>
                <span className={styles.flowStepLabel}>Solicitar</span>
                <span className={styles.flowStepSub}>Tornar público</span>
              </div>
              <div className={styles.flowArrow}>
                <ArrowRight size={16} />
              </div>
              <div className={styles.flowStep}>
                <div className={styles.flowStepIcon}>
                  <Shield size={18} />
                </div>
                <span className={styles.flowStepLabel}>Moderação</span>
                <span className={styles.flowStepSub}>Análise da equipe</span>
              </div>
              <div className={styles.flowArrow}>
                <ArrowRight size={16} />
              </div>
              <div className={styles.flowStep}>
                <div className={`${styles.flowStepIcon} ${styles.flowStepApproved}`}>
                  <Globe size={18} />
                </div>
                <span className={styles.flowStepLabel}>Aprovado</span>
                <span className={styles.flowStepSub}>Na galeria pública</span>
              </div>
            </div>
          </div>
        </section>

        <section id="xbox-qrcode" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={`${styles.sectionBadge} ${styles.xboxBadge}`}>
              <Gamepad2 size={14} />
              <span>Xbox Console</span>
            </div>
            <h2 className={styles.sectionTitle}>Login no Xbox via QR Code</h2>
            <p className={styles.sectionSubtitle}>
              Como o Xbox não oferece teclado físico de forma prática, criamos um sistema de
              autenticação por QR Code que permite logar no console usando seu celular.
            </p>
          </div>

          <div className={styles.xboxStepsGrid}>
            {XBOX_QR_STEPS.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className={styles.xboxStepCard}>
                  <div className={styles.xboxStepLeft}>
                    <div className={styles.xboxStepNumber}>{step.number}</div>
                    <div className={styles.xboxStepLine} />
                  </div>
                  <div className={styles.xboxStepContent}>
                    <div className={styles.xboxStepIconBox}>
                      <StepIcon size={20} />
                    </div>
                    <h3 className={styles.xboxStepTitle}>{step.title}</h3>
                    <p className={styles.xboxStepDesc}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.tipBox}>
            <Info size={18} className={styles.tipIcon} />
            <p className={styles.tipText}>
              <strong>Dica:</strong> Se o QR Code expirar, clique em "Gerar novo código" no
              console. O processo é o mesmo — escaneie e autorize pelo celular novamente.
            </p>
          </div>
        </section>

        <section className={styles.actionsSection}>
          <div className={styles.actionsInner}>
            <h2 className={styles.actionsTitle}>Pronto para começar?</h2>
            <p className={styles.actionsDesc}>
              Agora que você conhece todo o fluxo da plataforma, explore a galeria ou envie seus
              primeiros wallpapers para o console.
            </p>
            <div className={styles.actionsButtonGroup}>
              <Link to="/gallery" className={styles.btnPrimary} tabIndex={0}>
                Explorar Galeria
                <ArrowRight size={18} />
              </Link>
              <Link to="/upload" className={styles.btnSecondary} tabIndex={0}>
                <UploadCloud size={18} />
                Enviar Wallpaper
              </Link>
              <Link to="/levels" className={styles.btnGhost} tabIndex={0}>
                <Layers size={18} />
                Níveis &amp; Badges
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
