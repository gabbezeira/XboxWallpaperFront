import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  UploadCloud,
  CheckCircle2,
  Layers,
  ArrowRight,
  Check,
  Trophy,
} from 'lucide-react';
import VerifiedBadge from '../../components/VerifiedBadge';
import { useAuth } from '../../hooks/useAuth';
import { TIERS, getUserTier, getNextTier, getTierCssClass } from '../../config/tiers';
import styles from './styles.module.scss';

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
                <div className={`${styles.tierBadge} ${styles[getTierCssClass(currentTier)]}`}>
                  <currentTier.icon size={13} className={styles.badgeIcon} />
                  <span>{currentTier.badgeLabel}</span>
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
                  className={`${styles.tierCard} ${styles[`card_level_${tier.level}`]} ${isCurrent ? styles.activeTierCard : ''}`}
                >
                  {isCurrent && (
                    <div className={styles.currentTierMarker}>
                      <Check size={12} />
                      <span>Patente Ativa</span>
                    </div>
                  )}

                  <div className={styles.tierCardTop}>
                    <div className={`${styles.tierIconContainer} ${styles[`icon_level_${tier.level}`]}`}>
                      <TierIcon size={24} />
                    </div>
                    <div className={styles.tierMeta}>
                      <span className={`${styles.tierBadge} ${styles[getTierCssClass(tier)]}`}>
                        <TierIcon size={13} className={styles.badgeIcon} />
                        <span>{tier.badgeLabel}</span>
                      </span>
                      <span className={styles.tierFranchiseText}>{tier.franchise}</span>
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
              <h3 className={styles.ruleTitle}>Prevenção Anti-Fraude</h3>
              <p className={styles.ruleText}>
                Favoritos dados pelo próprio autor aos seus wallpapers não são computados na contagem de patente. Apenas interações de outros usuários geram pontos.
              </p>
            </div>

            <div className={styles.ruleCard}>
              <h3 className={styles.ruleTitle}>Proporção Recomendada 16:9</h3>
              <p className={styles.ruleText}>
                Como a plataforma é pensada para monitores e TVs de Xbox, papéis de parede em 16:9 aproveitam 100% da tela sem cortes ou barras pretas.
              </p>
            </div>

            <div className={styles.ruleCard}>
              <h3 className={styles.ruleTitle}>Fila de Moderação</h3>
              <p className={styles.ruleText}>
                Imagens enviadas passam por análise antes de serem listadas na galeria pública para manter o padrão estético e a conformidade das regras.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Pronto para começar?</h2>
          <p className={styles.ctaDesc}>
            Explore a galeria da comunidade ou envie seus primeiros wallpapers para o seu Xbox.
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
            <Link to="/guide" className={styles.btnTertiary} tabIndex={0}>
              Guia de Uso
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
