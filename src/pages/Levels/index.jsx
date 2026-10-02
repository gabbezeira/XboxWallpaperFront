import { useState } from 'react';
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
    name: 'Iniciado',
    minFavs: 0,
    maxFavs: 4,
    maxImages: 8,
    reqLabel: '0 a 4 favoritos',
    icon: Shield,
    desc: 'Grau inicial de recrutamento na rede Spartan. Permite subir suas primeiras artes para a galeria e submetê-las para a curadoria comunitária.',
    benefits: [
      'Acesso irrestrito a todo o catálogo e sistema de favoritos',
      'Cota base de 8 slots de upload',
      'Submissão aberta para a curadoria comunitária',
    ],
  },
  {
    key: 'explorador',
    name: 'Batedor Tático',
    minFavs: 5,
    maxFavs: 19,
    maxImages: 10,
    reqLabel: '5 a 19 favoritos',
    icon: Compass,
    desc: 'Primeiro marco de prestígio no campo. Suas capturas começam a ser adotadas e aplicadas nos consoles de outros jogadores.',
    benefits: [
      'Insígnia sólida de Batedor Tático no perfil',
      'Expansão de cota para 10 slots de upload (+2 adicionais)',
      'Prioridade de indexação em buscas por jogos e tags',
    ],
  },
  {
    key: 'criador',
    name: 'Sentinela',
    minFavs: 20,
    maxFavs: 49,
    maxImages: 12,
    reqLabel: '20 a 49 favoritos',
    icon: Sparkles,
    desc: 'Criador ativo com relevância reconhecida. Catálogo frequente de envios com alto índice de aprovação da curadoria.',
    benefits: [
      'Insígnia azul cobalto de Sentinela',
      'Expansão de cota para 12 slots de upload (+2 adicionais)',
      'Fila prioritária de análise na moderação',
      'Elegibilidade para o Selo de Criador Verificado',
    ],
  },
  {
    key: 'veterano',
    name: 'Vanguarda',
    minFavs: 50,
    maxFavs: 99,
    maxImages: 14,
    reqLabel: '50 a 99 favoritos',
    icon: Medal,
    desc: 'Patente de alta bravura e consistência. Membro respeitado com acervo autoral de papéis de parede em altíssima resolução.',
    benefits: [
      'Insígnia sólida violeta de Vanguarda',
      'Expansão de cota para 14 slots de upload (+2 adicionais)',
      'Inclusão direta na seleção de criadores recomendados',
      'Destaque autoral nas páginas de visualização de detalhes',
    ],
  },
  {
    key: 'elite',
    name: 'Comandante Nobre',
    minFavs: 100,
    maxFavs: 249,
    maxImages: 16,
    reqLabel: '100 a 249 favoritos',
    icon: Crown,
    desc: 'Patente nobre de autoridade artística. Seus papéis de parede figuram entre os mais curtidos e baixados de todo o ecossistema.',
    benefits: [
      'Insígnia dourada de Comandante Nobre',
      'Expansão de cota para 16 slots de upload (+2 adicionais)',
      'Elegibilidade para Coleção Oficial dedicada',
      'Candidatura permanente para os Hero Slides da Home',
    ],
  },
  {
    key: 'spartan',
    name: 'Spartan Mythic',
    minFavs: 250,
    maxFavs: null,
    maxImages: 18,
    reqLabel: '250+ favoritos',
    icon: Trophy,
    desc: 'O mais alto escalão lendário da comunidade. Maestria estética absoluta, referência definitiva de personalização de consoles.',
    benefits: [
      'Insígnia mestre verde Spartan Mythic',
      'Cota máxima definitiva de 18 slots de upload',
      'Destaque editorial vitalício em toda a plataforma',
      'Acesso a canal de curadoria direta com os administradores',
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
  const [avatarError, setAvatarError] = useState(false);

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
          <h1 className={styles.title}>Níveis e Badges</h1>
          <p className={styles.subtitle}>
            Entenda como funciona o sistema de progressão por favoritos recebidos, limites de upload e desbloqueio de recursos para criadores.
          </p>
          <div className={styles.divider} />
        </header>

        {user ? (
          <section className={styles.userStatusCard}>
            <div className={styles.userStatusHeader}>
              <div className={styles.userStatusProfile}>
                <div className={`${styles.avatar} ${!photoURL || avatarError ? styles.avatarFallback : ''}`}>
                  {photoURL && !avatarError ? (
                    <img
                      src={photoURL}
                      alt={displayName}
                      className={styles.avatarImg}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
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
                  <span className={styles.tierBadgeDot} />
                  <span>{currentTier.name.toUpperCase()}</span>
                </div>
                <div className={styles.favBadge} title="Total de Favoritos Recebidos">
                  <Heart size={14} className={styles.favHeartIcon} />
                  <span>{totalFavs} favoritos recebidos</span>
                </div>
              </div>
            </div>

            <div className={styles.progressSection}>
              {nextTier ? (
                <>
                  <div className={styles.progressInfo}>
                    <span className={styles.progressLabel}>
                      Próxima patente: <strong>{nextTier.name}</strong> ({nextTier.minFavs} favoritos)
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
                  <span>Patente máxima alcançada: Spartan Mythic.</span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className={styles.guestStatusCard}>
            <div className={styles.guestIconBox}>
              <Trophy size={28} />
            </div>
            <div className={styles.guestContent}>
              <h2 className={styles.guestTitle}>Monitore seu Progresso</h2>
              <p className={styles.guestText}>
                Faça login para acompanhar sua contagem de favoritos recebidos, sua patente atual e a quantidade restante para desbloquear novos slots de upload.
              </p>
            </div>
          </section>
        )}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Como Funciona a Progressão</h2>
            <p className={styles.sectionSubtitle}>
              O avanço de nível é automático e calculado com base nas curtidas que suas imagens públicas recebem de outros membros.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepIconBox}>
                <UploadCloud size={24} />
              </div>
              <h3 className={styles.stepTitle}>Envie seus Wallpapers</h3>
              <p className={styles.stepDesc}>
                Envie imagens de alta qualidade (1080p, 2K ou 4K) em formato JPG, PNG ou WebP na proporção 16:9.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepIconBox}>
                <Layers size={24} />
              </div>
              <h3 className={styles.stepTitle}>Solicite Publicação</h3>
              <p className={styles.stepDesc}>
                Na aba Meus Wallpapers, envie a imagem para a galeria comunitária para torná-la elegível a outros jogadores.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepIconBox}>
                <CheckCircle2 size={24} />
              </div>
              <h3 className={styles.stepTitle}>Análise da Moderação</h3>
              <p className={styles.stepDesc}>
                A curadoria avalia nitidez, ausência de artefatos de compressão e enquadramento na dashboard do console.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>04</div>
              <div className={styles.stepIconBox}>
                <Heart size={24} className={styles.stepHeartIcon} />
              </div>
              <h3 className={styles.stepTitle}>Receba Favoritos</h3>
              <p className={styles.stepDesc}>
                Cada favorito recebido de outro usuário soma 1 ponto direto à sua pontuação global de patente.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tabela Oficial de Patentes</h2>
            <p className={styles.sectionSubtitle}>
              Requisitos de favoritos necessários e privilégios desbloqueados em cada estágio.
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
                      <span>Patente Ativa</span>
                    </div>
                  )}

                  <div className={styles.tierCardTop}>
                    <div className={`${styles.tierIconContainer} ${styles[`icon_${tier.key}`]}`}>
                      <TierIcon size={24} />
                    </div>
                    <div className={styles.tierMeta}>
                      <span className={`${styles.tierBadge} ${styles[tier.key]}`}>
                        <span className={styles.tierBadgeDot} />
                        <span>{tier.name.toUpperCase()}</span>
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
            <h2 className={styles.sectionTitle}>Reconhecimentos Especiais</h2>
            <p className={styles.sectionSubtitle}>
              Distintivos atribuídos manualmente pela moderação a criadores com presença e qualidade consistentes.
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
                  Concedido pela curadoria a autores que publicam regularmente wallpapers em alta fidelidade visual, com enquadramento perfeito para a interface do console.
                </p>
                <div className={styles.badgeCriteriaBox}>
                  <span className={styles.criteriaTitle}>Critérios de Avaliação:</span>
                  <ul className={styles.criteriaList}>
                    <li>Resoluções nativas Full HD (1080p), 2K (1440p) ou 4K (2160p) nítidas.</li>
                    <li>Composição visual limpa e compatível com a dashboard do Xbox.</li>
                    <li>Sem marcas d&apos;água intrusivas, textos promocionais ou baixa resolução.</li>
                    <li>Respeito contínuo às diretrizes da comunidade e termos de uso.</li>
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
                <h3 className={styles.badgeCardTitle}>Coleção Oficial do Criador</h3>
                <p className={styles.badgeCardDesc}>
                  Página de coleção temática com link compartilhável e código rápido dedicada a fotógrafos virtuais e artistas com acervos consolidados.
                </p>
                <div className={styles.badgeCriteriaBox}>
                  <span className={styles.criteriaTitle}>Critérios de Atribuição:</span>
                  <ul className={styles.criteriaList}>
                    <li>Disponível para usuários com patente Sentinela ou superior.</li>
                    <li>Séries autorais consistentes (franquias, fotografia in-game temática).</li>
                    <li>Acesso ao painel Minha Coleção para organização dos papéis de parede.</li>
                    <li>Código de busca rápida exclusivo no catálogo oficial de coleções.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Regras de Integridade</h2>
            <p className={styles.sectionSubtitle}>
              Mecanismos automáticos e diretrizes para garantir uma competição sadia e balanceada.
            </p>
          </div>

          <div className={styles.rulesGrid}>
            <div className={styles.ruleCard}>
              <ShieldAlert size={20} className={styles.ruleIconWarning} />
              <div className={styles.ruleCardBody}>
                <h3 className={styles.ruleTitle}>Prevenção Anti-Fraude</h3>
                <p className={styles.ruleText}>
                  Favoritos dados pelo próprio autor aos seus wallpapers não são computados na contagem de patente. Apenas interações de outros usuários geram pontos.
                </p>
              </div>
            </div>

            <div className={styles.ruleCard}>
              <Sparkles size={20} className={styles.ruleIconPrimary} />
              <div className={styles.ruleCardBody}>
                <h3 className={styles.ruleTitle}>Proporção Recomendada 16:9</h3>
                <p className={styles.ruleText}>
                  Como a plataforma é pensada para monitores e TVs de Xbox, papéis de parede em 16:9 aproveitam 100% da tela sem cortes ou barras pretas.
                </p>
              </div>
            </div>

            <div className={styles.ruleCard}>
              <Info size={20} className={styles.ruleIconInfo} />
              <div className={styles.ruleCardBody}>
                <h3 className={styles.ruleTitle}>Fila de Moderação</h3>
                <p className={styles.ruleText}>
                  Imagens enviadas passam por análise antes de serem listadas na galeria pública para manter o padrão estético e a conformidade das regras.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.actionsSection}>
          <div className={styles.actionsInner}>
            <h2 className={styles.actionsTitle}>Pronto para compartilhar seus wallpapers?</h2>
            <p className={styles.actionsDesc}>
              Envie capturas em alta resolução ou explore as criações da comunidade para o seu Xbox.
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
              <Link to="/guide" className={styles.btnGhost} tabIndex={0}>
                Guia de Uso
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
