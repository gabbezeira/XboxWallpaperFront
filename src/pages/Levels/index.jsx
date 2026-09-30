import { Link } from 'react-router-dom';
import {
  Shield,
  Compass,
  Sparkles,
  Medal,
  Crown,
  Trophy,
  Heart,
  UploadCloud,
  CheckCircle2,
  Layers,
  Award,
  ArrowRight,
  Info,
  ShieldAlert,
  Check,
} from 'lucide-react';
import VerifiedBadge from '../../components/VerifiedBadge';
import { useAuth } from '../../hooks/useAuth';
import styles from './styles.module.scss';

const TIERS = [
  {
    key: 'recruta',
    name: 'Recruta',
    minFavs: 0,
    maxFavs: 4,
    reqLabel: '0 a 4 favoritos',
    icon: Shield,
    desc: 'Patente inicial de todo membro da comunidade. Permite enviar wallpapers para sua galeria pessoal, explorar o catálogo e interagir com as obras.',
    benefits: [
      'Acesso ao catálogo completo',
      'Upload de até 10 papéis de parede',
      'Solicitação de publicação na galeria comunitária',
    ],
  },
  {
    key: 'explorador',
    name: 'Explorador',
    minFavs: 5,
    maxFavs: 19,
    reqLabel: '5 a 19 favoritos',
    icon: Compass,
    desc: 'Primeiro grande marco da sua jornada. Suas criações começam a chamar a atenção de outros jogadores e ganham espaço na comunidade.',
    benefits: [
      'Badge exclusivo de Explorador no perfil',
      'Maior visibilidade na busca comunitária',
      'Elegível a destaques comunitários',
    ],
  },
  {
    key: 'criador',
    name: 'Criador',
    minFavs: 20,
    maxFavs: 49,
    reqLabel: '20 a 49 favoritos',
    icon: Sparkles,
    desc: 'Criador ativo com presença consolidada. Seus wallpapers são frequentemente salvos e aplicados em consoles de outros jogadores.',
    benefits: [
      'Badge azul de Criador reconhecido',
      'Prioridade na fila de moderação',
      'Elegibilidade para solicitação do Selo Verificado',
    ],
  },
  {
    key: 'veterano',
    name: 'Veterano',
    minFavs: 50,
    maxFavs: 99,
    reqLabel: '50 a 99 favoritos',
    icon: Medal,
    desc: 'Membro experiente com repertório sólido de imagens de alta resolução. Referência para novatos na plataforma.',
    benefits: [
      'Badge violeta de Veterano',
      'Destaque na página de detalhes das suas obras',
      'Inclusão nas trilhas recomendadas da comunidade',
    ],
  },
  {
    key: 'elite',
    name: 'Elite',
    minFavs: 100,
    maxFavs: 249,
    reqLabel: '100 a 249 favoritos',
    icon: Crown,
    desc: 'Nível avançado com grande prestígio. Suas obras estão entre as mais populares e curtidas de todo o catálogo.',
    benefits: [
      'Badge dourada de Elite',
      'Elegibilidade para Coleção Própria oficial',
      'Candidato para o Hero Slider da página inicial',
    ],
  },
  {
    key: 'spartan',
    name: 'Spartan Ultimate',
    minFavs: 250,
    maxFavs: null,
    reqLabel: '250+ favoritos',
    icon: Trophy,
    desc: 'A patente máxima do ecossistema. Ícone supremo da comunidade Spartan, reconhecido por maestria visual e paixão pela marca Xbox.',
    benefits: [
      'Badge mestre verde Spartan Ultimate',
      'Destaque permanente em toda a plataforma',
      'Canal prioritário de curadoria com a administração',
    ],
  },
];

function getUserTier(favs = 0) {
  if (favs >= 250) return TIERS[5];
  if (favs >= 100) return TIERS[4];
  if (favs >= 50) return TIERS[3];
  if (favs >= 20) return TIERS[2];
  if (favs >= 5) return TIERS[1];
  return TIERS[0];
}

function getNextTier(currentTierKey) {
  const currentIndex = TIERS.findIndex((t) => t.key === currentTierKey);
  if (currentIndex < 0 || currentIndex >= TIERS.length - 1) return null;
  return TIERS[currentIndex + 1];
}

export default function Levels() {
  const { user, profile } = useAuth();

  const totalFavs = profile?.totalFavoritesReceived || 0;
  const currentTier = getUserTier(totalFavs);
  const nextTier = getNextTier(currentTier.key);

  const displayName =
    profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Usuário';
  const photoURL = profile?.photoURL || user?.photoURL;

  const favsInCurrentTier = totalFavs - currentTier.minFavs;
  const favsNeededForNext = nextTier ? nextTier.minFavs - currentTier.minFavs : 1;
  const remainingFavs = nextTier ? nextTier.minFavs - totalFavs : 0;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headerBadge}>
            <Award size={16} />
            <span>Sistema de Patentes &amp; Reconhecimento</span>
          </div>
          <h1 className={styles.title}>Níveis e Badges</h1>
          <p className={styles.subtitle}>
            Descubra como evoluir sua patente na comunidade Spartan Wallpapers, conquistar novos selos
            exclusivos e transformar suas criações em destaque nos consoles Xbox de todo o mundo.
          </p>
          <div className={styles.divider} />
        </header>

        {user ? (
          <section className={styles.userStatusCard}>
            <div className={styles.userStatusHeader}>
              <div className={styles.userStatusProfile}>
                <div className={`${styles.avatar} ${!photoURL ? styles.avatarFallback : ''}`}>
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={displayName}
                      className={styles.avatarImg}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.insertAdjacentText(
                          'afterend',
                          displayName.charAt(0).toUpperCase(),
                        );
                      }}
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className={styles.userStatusMeta}>
                  <div className={styles.userStatusNameRow}>
                    <span className={styles.userStatusName}>{displayName}</span>
                    {Boolean(profile?.isVerified) && (
                      <VerifiedBadge size={16} title="Criador Verificado" />
                    )}
                  </div>
                  {Boolean(profile?.userTag) && (
                    <span className={styles.userStatusTag}>{profile.userTag}</span>
                  )}
                </div>
              </div>

              <div className={styles.userStatusBadges}>
                <div className={`${styles.tierBadge} ${styles[currentTier.key]}`}>
                  {currentTier.name.toUpperCase()}
                </div>
                <div className={styles.favBadge} title="Total de Favoritos Recebidos">
                  <Heart size={14} className={styles.favHeartIcon} />
                  <span>{totalFavs} favoritos</span>
                </div>
              </div>
            </div>

            <div className={styles.progressSection}>
              {nextTier ? (
                <>
                  <div className={styles.progressInfo}>
                    <span className={styles.progressLabel}>
                      Próxima patente: <strong>{nextTier.name}</strong>
                    </span>
                    <span className={styles.progressRemaining}>
                      Faltam <strong>{remainingFavs}</strong> {remainingFavs === 1 ? 'favorito' : 'favoritos'}
                    </span>
                  </div>
                  <progress
                    className={styles.progressBar}
                    value={Math.max(0, favsInCurrentTier)}
                    max={favsNeededForNext}
                  />
                </>
              ) : (
                <div className={styles.maxTierNotice}>
                  <Trophy size={18} className={styles.maxTierIcon} />
                  <span>Você atingiu a patente máxima! Você é um Spartan Ultimate lendário.</span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className={styles.guestStatusCard}>
            <div className={styles.guestIconBox}>
              <Award size={28} />
            </div>
            <div className={styles.guestContent}>
              <h2 className={styles.guestTitle}>Acompanhe Sua Jornada</h2>
              <p className={styles.guestText}>
                Faça login para acompanhar sua contagem de favoritos recebidos, visualizar seu nível atual em tempo real e ver quantos pontos faltam para alcançar a próxima patente.
              </p>
            </div>
          </section>
        )}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Como Subir de Nível</h2>
            <p className={styles.sectionSubtitle}>
              Sua evolução é baseada no impacto das suas criações e no apreço da comunidade.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepIconBox}>
                <UploadCloud size={24} />
              </div>
              <h3 className={styles.stepTitle}>Envie Wallpapers</h3>
              <p className={styles.stepDesc}>
                Suba capturas e artes em alta resolução (1080p, 2K ou 4K) em formato JPG, PNG ou WebP através da aba Enviar.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepIconBox}>
                <Layers size={24} />
              </div>
              <h3 className={styles.stepTitle}>Solicite Publicação</h3>
              <p className={styles.stepDesc}>
                Em Meus Wallpapers, solicite a publicação comunitária dos seus envios para que sejam avaliados pela moderação.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepIconBox}>
                <CheckCircle2 size={24} />
              </div>
              <h3 className={styles.stepTitle}>Curadoria &amp; Aprovação</h3>
              <p className={styles.stepDesc}>
                Nossa equipe analisa a fidelidade visual, ausência de distorções e adequação à tela do console Xbox.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>04</div>
              <div className={styles.stepIconBox}>
                <Heart size={24} className={styles.stepHeartIcon} />
              </div>
              <h3 className={styles.stepTitle}>Conquiste Favoritos</h3>
              <p className={styles.stepDesc}>
                Cada jogador que favoritar seu wallpaper público soma 1 ponto direto à sua contagem global de patente.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>As 6 Patentes Oficiais</h2>
            <p className={styles.sectionSubtitle}>
              Conheça todos os estágios de progressão, requisitos de favoritos e privilégios de cada nível.
            </p>
          </div>

          <div className={styles.tiersGrid}>
            {TIERS.map((tier) => {
              const TierIcon = tier.icon;
              const isCurrent = user && currentTier.key === tier.key;

              return (
                <div
                  key={tier.key}
                  className={`${styles.tierCard} ${styles[`card_${tier.key}`]} ${isCurrent ? styles.activeTierCard : ''}`}
                >
                  {isCurrent && (
                    <div className={styles.currentTierMarker}>
                      <Check size={12} />
                      <span>Sua Patente Atual</span>
                    </div>
                  )}

                  <div className={styles.tierCardTop}>
                    <div className={`${styles.tierIconContainer} ${styles[`icon_${tier.key}`]}`}>
                      <TierIcon size={24} />
                    </div>
                    <div className={styles.tierMeta}>
                      <span className={`${styles.tierBadge} ${styles[tier.key]}`}>
                        {tier.name.toUpperCase()}
                      </span>
                      <span className={styles.tierReqText}>{tier.reqLabel}</span>
                    </div>
                  </div>

                  <p className={styles.tierDescription}>{tier.desc}</p>

                  <div className={styles.tierBenefitsList}>
                    {tier.benefits.map((b) => (
                      <div key={b} className={styles.benefitItem}>
                        <CheckCircle2 size={14} className={styles.benefitCheck} />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Badges &amp; Reconhecimentos Especiais</h2>
            <p className={styles.sectionSubtitle}>
              Símbolos de prestígio atribuídos pela administração aos criadores mais dedicados da plataforma.
            </p>
          </div>

          <div className={styles.badgesGrid}>
            <div className={styles.badgeHighlightCard}>
              <div className={styles.badgeShowcase}>
                <VerifiedBadge size={36} />
              </div>
              <div className={styles.badgeCardContent}>
                <h3 className={styles.badgeCardTitle}>Selo de Criador Verificado</h3>
                <p className={styles.badgeCardDesc}>
                  O selo de verificação é concedido manualmente pela equipe aos autores que mantêm um padrão constante de excelência e confiabilidade em seus uploads.
                </p>
                <div className={styles.badgeCriteriaBox}>
                  <span className={styles.criteriaTitle}>Critérios de Elegibilidade:</span>
                  <ul className={styles.criteriaList}>
                    <li>Resoluções nativas superiores (Full HD, 2K QHD ou 4K UHD nítidos).</li>
                    <li>Composição otimizada para o layout de blocos e relógio da dashboard do Xbox.</li>
                    <li>Ausência de artefatos visuais de baixa qualidade ou marcas d&apos;água intrusivas.</li>
                    <li>Histórico contínuo de respeito aos Termos de Uso e diretrizes comunitárias.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.badgeHighlightCard}>
              <div className={styles.badgeShowcase}>
                <div className={styles.collectionIconBox}>
                  <Layers size={32} />
                </div>
              </div>
              <div className={styles.badgeCardContent}>
                <h3 className={styles.badgeCardTitle}>Criador com Coleção Própria</h3>
                <p className={styles.badgeCardDesc}>
                  Artistas, fotógrafos virtuais e curadores temáticos podem ter uma página de coleção dedicada vinculada ao seu perfil e exibida no catálogo oficial.
                </p>
                <div className={styles.badgeCriteriaBox}>
                  <span className={styles.criteriaTitle}>Como Funciona:</span>
                  <ul className={styles.criteriaList}>
                    <li>Atribuído a criadores da patente Criador ou superior.</li>
                    <li>Séries temáticas consolidadas (ex: franquias Halo, Forza, Gears, Cyberpunk).</li>
                    <li>Acesso à aba Minha Coleção para organização de wallpapers dedicados.</li>
                    <li>Destaque nas trilhas de coleções na página inicial e de exploração.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Regras do Sistema &amp; Integridade</h2>
            <p className={styles.sectionSubtitle}>
              Diretrizes para manter o ecossistema justo, transparente e gratificante para todos.
            </p>
          </div>

          <div className={styles.rulesGrid}>
            <div className={styles.ruleCard}>
              <ShieldAlert size={20} className={styles.ruleIconWarning} />
              <div className={styles.ruleCardBody}>
                <h3 className={styles.ruleTitle}>Proteção Anti-Farm</h3>
                <p className={styles.ruleText}>
                  Favoritos concedidos pelo próprio autor às suas próprias imagens não somam pontos no contador de patente. Apenas favoritos genuínos de outros membros são contabilizados.
                </p>
              </div>
            </div>

            <div className={styles.ruleCard}>
              <Sparkles size={20} className={styles.ruleIconPrimary} />
              <div className={styles.ruleCardBody}>
                <h3 className={styles.ruleTitle}>Padrão de Resolução 16:9</h3>
                <p className={styles.ruleText}>
                  Como o Spartan Wallpapers foi desenhado para televisores e monitores de console, priorizamos a proporção 16:9 para um ajuste visual perfeito sem cortes indesejados.
                </p>
              </div>
            </div>

            <div className={styles.ruleCard}>
              <Info size={20} className={styles.ruleIconInfo} />
              <div className={styles.ruleCardBody}>
                <h3 className={styles.ruleTitle}>Moderação Comunitária</h3>
                <p className={styles.ruleText}>
                  Envios com conteúdo ofensivo, impróprio ou repetido são reprovados na moderação e podem levar à suspensão do direito de publicar wallpapers públicos.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.actionsSection}>
          <div className={styles.actionsInner}>
            <h2 className={styles.actionsTitle}>Pronto para iniciar sua jornada?</h2>
            <p className={styles.actionsDesc}>
              Compartilhe suas melhores capturas com a comunidade Xbox ou descubra novos papéis de parede para o seu console.
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
              <Link to="/terms" className={styles.btnGhost} tabIndex={0}>
                Termos de Uso
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
