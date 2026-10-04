import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  UploadCloud,
  Check,
  Layers,
  ArrowRight,
  Trophy,
  HardDrive,
  ShieldCheck,
} from 'lucide-react';
import VerifiedBadge from '../../components/VerifiedBadge';
import PageHeader from '../../components/PageHeader';
import UserAvatar from '../../components/UserAvatar';
import { useAuth } from '../../hooks/useAuth';
import { TIERS, getUserTier, getNextTier, getTierCssClass } from '../../config/tiers';
import styles from './styles.module.scss';

export default function Levels() {
  const { user, profile } = useAuth();

  const totalFavs = profile?.totalFavoritesReceived || 0;
  const currentTier = useMemo(() => getUserTier(totalFavs), [totalFavs]);
  const nextTier = useMemo(() => getNextTier(currentTier.key), [currentTier.key]);

  const displayName =
    profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Criador';
  const photoURL = profile?.photoURL || user?.photoURL;

  const favsInCurrentTier = totalFavs - currentTier.minFavs;
  const favsNeededForNext = nextTier ? nextTier.minFavs - currentTier.minFavs : 1;
  const remainingFavs = nextTier ? Math.max(0, nextTier.minFavs - totalFavs) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <PageHeader
          kicker="Ecossistema de Criadores"
          title="Níveis e Conquistas"
          subtitle="Conquiste patentes oficiais de acordo com os favoritos recebidos em seus wallpapers. Cada nível desbloqueia mais slots de armazenamento e maior visibilidade na plataforma."
          action={
            user && (
              <Link to="/upload" className={styles.btnHeaderAction} tabIndex={0}>
                <UploadCloud size={16} />
                <span>Enviar Wallpaper</span>
              </Link>
            )
          }
        />

        {user ? (
          <section className={styles.userDashboard}>
            <div className={styles.userProfileRow}>
              <div className={styles.userIdentity}>
                <UserAvatar photoUrl={photoURL} name={displayName} size="large" />
                <div className={styles.userInfo}>
                  <div className={styles.userNameRow}>
                    <span className={styles.userName}>{displayName}</span>
                    {Boolean(profile?.isVerified) && (
                      <VerifiedBadge size={16} title="Criador Verificado" />
                    )}
                  </div>
                  {Boolean(profile?.userTag) && (
                    <span className={styles.userTag}>{profile.userTag}</span>
                  )}
                </div>
              </div>

              <div className={styles.userBadgeWrapper}>
                <div className={`${styles.tierBadge} ${styles[getTierCssClass(currentTier)]}`}>
                  <currentTier.icon size={14} className={styles.badgeIcon} />
                  <span>{currentTier.badgeLabel}</span>
                </div>
              </div>
            </div>

            <div className={styles.userMetricsGrid}>
              <div className={styles.metricCard}>
                <span className={styles.metricValue}>{currentTier.name}</span>
                <span className={styles.metricLabel}>Patente Atual ({currentTier.franchise})</span>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricValueWithIcon}>
                  <Heart size={18} className={styles.metricHeartIcon} />
                  <span className={styles.metricValue}>{totalFavs}</span>
                </div>
                <span className={styles.metricLabel}>Favoritos Conquistados</span>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricValueWithIcon}>
                  <HardDrive size={18} className={styles.metricStorageIcon} />
                  <span className={styles.metricValue}>{currentTier.maxImages} slots</span>
                </div>
                <span className={styles.metricLabel}>Capacidade de Armazenamento</span>
              </div>
            </div>

            <div className={styles.progressContainer}>
              {nextTier ? (
                <>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressTarget}>
                      Próxima patente: <strong>{nextTier.name}</strong> ({nextTier.minFavs} favoritos)
                    </span>
                    <span className={styles.progressCount}>
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
                <div className={styles.maxTierContainer}>
                  <Trophy size={18} className={styles.maxTierIcon} />
                  <span>Você atingiu a patente máxima: Spartan Mythic 117. Obrigado pela dedicação à comunidade!</span>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className={styles.guestBanner}>
            <div className={styles.guestIcon}>
              <Trophy size={28} />
            </div>
            <div className={styles.guestInfo}>
              <h2 className={styles.guestTitle}>Inicie sua jornada de criador</h2>
              <p className={styles.guestText}>
                Entre com sua conta para monitorar suas patentes, acompanhar favoritos em tempo real e desbloquear mais slots de armazenamento.
              </p>
            </div>
          </section>
        )}

        <section className={styles.mainSection}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>Tabela de Patentes Oficiais</h2>
            <p className={styles.sectionDescription}>
              Seis estágios inspirados nos universos mais icônicos do Xbox. Conquiste novos patamares aumentando o engajamento da comunidade.
            </p>
          </div>

          <div className={styles.tiersGrid}>
            {TIERS.map((tier) => {
              const TierIcon = tier.icon;
              const isCurrent = user && currentTier.key === tier.key;

              return (
                <article
                  key={tier.key}
                  className={`${styles.tierCard} ${isCurrent ? styles.activeTierCard : ''}`}
                >
                  <div className={styles.tierCardHeader}>
                    <div className={`${styles.tierBadge} ${styles[getTierCssClass(tier)]}`}>
                      <TierIcon size={14} className={styles.badgeIcon} />
                      <span>{tier.badgeLabel}</span>
                    </div>
                    {isCurrent && (
                      <span className={styles.activeTag}>
                        <Check size={12} />
                        Sua Patente
                      </span>
                    )}
                  </div>

                  <div className={styles.tierNameBlock}>
                    <h3 className={styles.tierTitle}>{tier.name}</h3>
                    <span className={styles.tierFranchise}>{tier.franchise}</span>
                  </div>

                  <div className={styles.tierSpecs}>
                    <div className={styles.tierSpecItem}>
                      <span className={styles.specLabel}>Requisito</span>
                      <span className={styles.specValue}>{tier.reqLabel}</span>
                    </div>
                    <div className={styles.tierSpecItem}>
                      <span className={styles.specLabel}>Cota Máxima</span>
                      <span className={styles.specValueHighlight}>{tier.maxImages} slots</span>
                    </div>
                  </div>

                  <p className={styles.tierSummary}>{tier.desc}</p>

                  <ul className={styles.tierPerks}>
                    {tier.benefits.map((benefit) => (
                      <li key={benefit} className={styles.tierPerkItem}>
                        <Check size={14} className={styles.perkIcon} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.mainSection}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>Distintivos Especiais da Comunidade</h2>
            <p className={styles.sectionDescription}>
              Condecorações concedidas pela equipe de curadoria para criadores com presença e qualidade excepcionais.
            </p>
          </div>

          <div className={styles.highlightsGrid}>
            <div className={styles.highlightCard}>
              <div className={styles.highlightIconBox}>
                <VerifiedBadge size={32} />
              </div>
              <div className={styles.highlightContent}>
                <h3 className={styles.highlightTitle}>Selo de Criador Verificado</h3>
                <p className={styles.highlightText}>
                  Atribuído a fotógrafos e designers virtuais que publicam regularmente capturas em resoluções nativas (1080p, 2K e 4K), com composição limpa e compatível com a dashboard do console.
                </p>
                <div className={styles.highlightFooter}>
                  <ShieldCheck size={14} className={styles.highlightFooterIcon} />
                  <span>Atribuição editorial pela curadoria oficial</span>
                </div>
              </div>
            </div>

            <div className={styles.highlightCard}>
              <div className={styles.highlightIconBox}>
                <div className={styles.collectionIconWrapper}>
                  <Layers size={28} />
                </div>
              </div>
              <div className={styles.highlightContent}>
                <h3 className={styles.highlightTitle}>Coleção Oficial de Criador</h3>
                <p className={styles.highlightText}>
                  Página temática dedicada com slug personalizado, código de busca direta para console e celular, e gerenciamento prioritário no painel Minha Coleção.
                </p>
                <div className={styles.highlightFooter}>
                  <ShieldCheck size={14} className={styles.highlightFooterIcon} />
                  <span>Disponível para criadores a partir da patente COG</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.mainSection}>
          <div className={styles.sectionHeading}>
            <h2 className={styles.sectionTitle}>Diretrizes do Sistema</h2>
            <p className={styles.sectionDescription}>
              Regras fundamentais para manter uma competição equilibrada e a integridade da galeria.
            </p>
          </div>

          <div className={styles.guidelinesGrid}>
            <div className={styles.guidelineCard}>
              <h3 className={styles.guidelineTitle}>Curtidas Orgânicas</h3>
              <p className={styles.guidelineText}>
                Apenas favoritos concedidos por outros membros contam pontos. Auto-favoritos e contas suspeitas são desconsiderados automaticamente.
              </p>
            </div>

            <div className={styles.guidelineCard}>
              <h3 className={styles.guidelineTitle}>Padrão 16:9 Nativo</h3>
              <p className={styles.guidelineText}>
                As imagens devem respeitar a proporção 16:9 em alta definição para garantir visualização perfeita em TVs e monitores Xbox sem distorção.
              </p>
            </div>

            <div className={styles.guidelineCard}>
              <h3 className={styles.guidelineTitle}>Curadoria de Qualidade</h3>
              <p className={styles.guidelineText}>
                Wallpapers públicos passam por avaliação de nitidez e enquadramento para manter a melhor experiência visual no ecossistema.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Pronto para expandir seu acervo?</h2>
            <p className={styles.ctaText}>
              Navegue pela galeria comunitária para favoritar outros criadores ou faça o upload das suas melhores capturas.
            </p>
          </div>
          <div className={styles.ctaButtons}>
            <Link to="/gallery" className={styles.btnPrimary} tabIndex={0}>
              <span>Explorar Galeria</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/upload" className={styles.btnSecondary} tabIndex={0}>
              <UploadCloud size={16} />
              <span>Enviar Wallpaper</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
