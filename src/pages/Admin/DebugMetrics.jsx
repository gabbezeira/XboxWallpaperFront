import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import {
  Activity,
  RefreshCw,
  RotateCcw,
  Database,
  Server,
  Zap,
  HardDrive,
  Layers,
  Heart,
  Image as ImageIcon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import styles from './styles.module.scss';

const DAILY_FREE_READS_LIMIT = 50000;

function formatUptime(seconds = 0) {
  if (!seconds) return '0s';
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

export default function DebugMetrics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const timerRef = useRef(null);

  const fetchMetrics = async (isBackground = false) => {
    try {
      if (!isBackground) setRefreshing(true);
      const res = await api.admin.getFirestoreMetrics();
      setData(res);
      setActionError(null);
    } catch (err) {
      setActionError(err.message || 'Erro ao carregar telemetria');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        fetchMetrics(true);
      }, 10000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh]);

  const handleReset = async () => {
    if (!window.confirm('Deseja zerar os contadores de telemetria acumulados nesta instância?')) {
      return;
    }
    try {
      setResetting(true);
      await api.admin.resetFirestoreMetrics();
      setActionMessage('Métricas zeradas com sucesso.');
      await fetchMetrics();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      setActionError(err.message || 'Erro ao zerar métricas');
    } finally {
      setResetting(false);
    }
  };

  const handleRebuildTags = async () => {
    try {
      setRebuilding(true);
      const res = await api.admin.rebuildTagsMetadata();
      setActionMessage(`Metadados de tags reconstruídos com sucesso (${res.tagsCount || 0} tags, ${res.gamesCount || 0} jogos).`);
      await fetchMetrics();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      setActionError(err.message || 'Erro ao reconstruir metadados');
    } finally {
      setRebuilding(false);
    }
  };

  if (loading) {
    return <Loader text="Carregando telemetria e métricas..." />;
  }

  const metricsObj = data?.metrics || {};
  const server = data?.server || {};
  const caches = data?.caches || {};

  const endpointList = Object.entries(metricsObj).map(([endpoint, stats]) => ({
    endpoint,
    ...stats,
  }));

  const totalReads = endpointList.reduce((acc, curr) => acc + (curr.totalReads || 0), 0);
  const totalRequests = endpointList.reduce((acc, curr) => acc + (curr.totalRequests || 0), 0);
  const avgReadsGlobal = totalRequests > 0 ? (totalReads / totalRequests).toFixed(2) : '0.00';
  const quotaPercent = Math.min(100, Number(((totalReads / DAILY_FREE_READS_LIMIT) * 100).toFixed(2)));

  return (
    <div className={styles.viewContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleArea}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>Observabilidade & Métricas do Sistema</h2>
            <span className={styles.liveIndicator}>
              <span className={styles.liveDot} />
              <span>Tempo Real</span>
            </span>
          </div>
          <p className={styles.sectionSubtitle}>
            Consumo em leituras do Firestore, integridade dos caches em memória e telemetria da instância (0 leituras adicionais no banco).
          </p>
        </div>

        <div className={styles.toolbarActions}>
          <label className={styles.autoRefreshToggle}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto (10s)</span>
          </label>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => fetchMetrics()}
            disabled={refreshing}
            title="Atualizar dados"
          >
            <RefreshCw size={14} className={refreshing ? styles.spinIcon : ''} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleRebuildTags}
            disabled={rebuilding}
            title="Forçar agregação de tags no Firestore"
          >
            <Database size={14} />
            <span>{rebuilding ? 'Reconstruindo...' : 'Reconstruir Tags'}</span>
          </button>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleReset}
            disabled={resetting}
            title="Zerar contadores desta instância"
          >
            <RotateCcw size={14} />
            <span>{resetting ? 'Zerando...' : 'Zerar Contadores'}</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className={styles.successBanner}>
          <CheckCircle2 size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className={styles.errorAlert}>
          <AlertTriangle size={16} />
          <div className={styles.errorAlertContent}>
            <span className={styles.errorAlertTitle}>Erro de Telemetria</span>
            <span className={styles.errorAlertMessage}>{actionError}</span>
          </div>
        </div>
      )}

      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Reads Rastreados</span>
            <Database size={16} />
          </div>
          <div className={styles.kpiValue}>{totalReads.toLocaleString('pt-BR')}</div>
          <div className={styles.quotaBarWrapper}>
            <progress
              className={styles.quotaProgress}
              value={Math.min(totalReads, DAILY_FREE_READS_LIMIT)}
              max={DAILY_FREE_READS_LIMIT}
            />
          </div>
          <span className={styles.kpiSub}>
            {quotaPercent}% do limite diário gratuito ({DAILY_FREE_READS_LIMIT.toLocaleString('pt-BR')})
          </span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Média Reads / Req</span>
            <Zap size={16} />
          </div>
          <div className={`${styles.kpiValue} ${Number(avgReadsGlobal) < 2 ? styles.kpiValueHighlight : ''}`}>
            {avgReadsGlobal}
          </div>
          <span className={styles.kpiSub}>
            {Number(avgReadsGlobal) < 2 ? 'Alta eficiência (< 2.0)' : 'Atenção a novos endpoints'}
          </span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Requisições Totais</span>
            <Activity size={16} />
          </div>
          <div className={styles.kpiValue}>{totalRequests.toLocaleString('pt-BR')}</div>
          <span className={styles.kpiSub}>Rastreadas pelo middleware</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Servidor & Uptime</span>
            <Server size={16} />
          </div>
          <div className={styles.kpiValue}>{formatUptime(server.uptimeSeconds)}</div>
          <span className={styles.kpiSub}>
            Heap: {server.heapUsedMB || 0}MB / {server.heapTotalMB || 0}MB ({server.nodeVersion || 'Node.js'})
          </span>
        </div>
      </section>

      <div className={styles.debugSection}>
        <div className={styles.debugSectionHeader}>
          <HardDrive size={18} />
          <h3 className={styles.debugSectionTitle}>Estado dos Caches em Memória da Instância</h3>
        </div>

        <div className={styles.cacheGrid}>
          <div className={styles.cacheCard}>
            <div className={styles.cacheCardHeader}>
              <ImageIcon size={16} />
              <span className={styles.cacheCardTitle}>Listagem de Wallpapers</span>
            </div>
            <div className={styles.cacheCardValue}>
              {caches.wallpapersList?.listQueriesCount ?? 0}
            </div>
            <span className={styles.cacheCardSub}>
              {caches.wallpapersList?.singleWallpapersCount ?? 0} wallpapers únicos | {caches.wallpapersList?.userPrefsCount ?? 0} preferências
            </span>
          </div>

          <div className={styles.cacheCard}>
            <div className={styles.cacheCardHeader}>
              <Database size={16} />
              <span className={styles.cacheCardTitle}>Tags Agregadas</span>
            </div>
            <div className={styles.cacheCardValue}>
              {caches.wallpapersList?.tagsLoaded ? 'Carregado' : 'Aguardando'}
            </div>
            <span className={styles.cacheCardSub}>
              {caches.wallpapersList?.tagsLoaded ? 'Documento metadata/tags ativo' : 'Próxima chamada carregará'}
            </span>
          </div>

          <div className={styles.cacheCard}>
            <div className={styles.cacheCardHeader}>
              <Heart size={16} />
              <span className={styles.cacheCardTitle}>Favoritos por Usuário</span>
            </div>
            <div className={styles.cacheCardValue}>
              {caches.favorites?.cachedUsersCount ?? 0}
            </div>
            <span className={styles.cacheCardSub}>Sessões de usuários ativas em cache (TTL 3m)</span>
          </div>

          <div className={styles.cacheCard}>
            <div className={styles.cacheCardHeader}>
              <Layers size={16} />
              <span className={styles.cacheCardTitle}>Coleções Oficiais</span>
            </div>
            <div className={styles.cacheCardValue}>
              {caches.collections?.cached ? `${caches.collections.itemsCount} itens` : 'Vazio'}
            </div>
            <span className={styles.cacheCardSub}>TTL 10 min + Edge CDN</span>
          </div>

          <div className={styles.cacheCard}>
            <div className={styles.cacheCardHeader}>
              <ImageIcon size={16} />
              <span className={styles.cacheCardTitle}>Hero Slides</span>
            </div>
            <div className={styles.cacheCardValue}>
              {caches.hero?.cached ? `${caches.hero.slidesCount} slides` : 'Vazio'}
            </div>
            <span className={styles.cacheCardSub}>TTL 24h + Edge CDN</span>
          </div>

          <div className={styles.cacheCard}>
            <div className={styles.cacheCardHeader}>
              <ShieldCheck size={16} />
              <span className={styles.cacheCardTitle}>Mídia com Assinatura HMAC</span>
            </div>
            <div className={styles.cacheCardValue}>
              {caches.mediaSigner?.cachedPathsCount ?? 0}
            </div>
            <span className={styles.cacheCardSub}>Paths mapeados sem consulta ao Firestore</span>
          </div>
        </div>
      </div>

      <div className={styles.debugSection}>
        <div className={styles.debugSectionHeader}>
          <Activity size={18} />
          <h3 className={styles.debugSectionTitle}>Consumo Detalhado por Endpoint</h3>
        </div>

        {endpointList.length === 0 ? (
          <div className={styles.emptyState}>
            <Activity size={36} className={styles.emptyIcon} />
            <h4 className={styles.emptyTitle}>Nenhuma Requisição Rastreada</h4>
            <p className={styles.emptyText}>
              Navegue pela plataforma ou acione endpoints para visualizar o consumo em tempo real.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Requisições</th>
                  <th>Reads Totais</th>
                  <th>Média Reads/Req</th>
                  <th>Máx Reads/Req</th>
                  <th>Duração Média</th>
                  <th>Eficiência</th>
                </tr>
              </thead>
              <tbody>
                {endpointList
                  .sort((a, b) => (b.totalReads || 0) - (a.totalReads || 0))
                  .map((row) => {
                    const avg = Number(row.avgReadsPerRequest || 0);
                    let badgeClass = styles.badgeSuccess;
                    let badgeText = '0 reads';

                    if (avg === 0) {
                      badgeClass = styles.badgeZero;
                      badgeText = 'Zero Reads';
                    } else if (avg <= 2) {
                      badgeClass = styles.badgeSuccess;
                      badgeText = 'Excelente';
                    } else if (avg <= 15) {
                      badgeClass = styles.badgeInfo;
                      badgeText = 'Otimizado';
                    } else {
                      badgeClass = styles.badgeWarning;
                      badgeText = 'Atenção';
                    }

                    return (
                      <tr key={row.endpoint}>
                        <td>
                          <code className={styles.endpointCode}>{row.endpoint}</code>
                        </td>
                        <td>
                          <span className={styles.statPill}>{(row.totalRequests || 0).toLocaleString('pt-BR')}</span>
                        </td>
                        <td>
                          <strong className={styles.readsValue}>{(row.totalReads || 0).toLocaleString('pt-BR')}</strong>
                        </td>
                        <td>{avg.toFixed(2)}</td>
                        <td>{row.maxReads || 0}</td>
                        <td>{row.avgDurationMs ? `${row.avgDurationMs}ms` : '-'}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${badgeClass}`}>
                            {badgeText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
