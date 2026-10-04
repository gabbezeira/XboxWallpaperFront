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
  Cloud,
  FileBox,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';
import styles from './styles.module.scss';

const DAILY_FREE_READS_LIMIT = 50000;
const SPARK_STORAGE_LIMIT_MB = 5120;

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

function formatRelativeTime(isoDateStr) {
  if (!isoDateStr) return '-';
  try {
    const date = new Date(isoDateStr);
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s atrás`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m atrás`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    return date.toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

export default function DebugMetrics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recalculatingStorage, setRecalculatingStorage] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);

  const fetchMetrics = async (isBackground = false, forceStorage = false, forceStats = false) => {
    try {
      if (!isBackground) setRefreshing(true);
      const res = await api.admin.getFirestoreMetrics({ forceStorage, forceStats });
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

  const handleRefreshStorage = async () => {
    try {
      setRecalculatingStorage(true);
      const res = await api.admin.refreshStorageMetrics();
      if (res?.storage) {
        setData((prev) => ({ ...prev, storage: res.storage }));
        setActionMessage(`Armazenamento recalculado: ${res.storage.fileCount} arquivos (${res.storage.totalMB} MB).`);
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      setActionError(err.message || 'Erro ao recalcular armazenamento');
    } finally {
      setRecalculatingStorage(false);
    }
  };

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
      await fetchMetrics(false, false, true);
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
  const storage = data?.storage || {};
  const firestoreDatabase = data?.firestoreDatabase || {};

  const endpointList = Object.entries(metricsObj).map(([endpoint, stats]) => ({
    endpoint,
    ...stats,
  }));

  const totalReads = endpointList.reduce((acc, curr) => acc + (curr.totalReads || 0), 0);
  const totalRequests = endpointList.reduce((acc, curr) => acc + (curr.totalRequests || 0), 0);
  const avgReadsGlobal = totalRequests > 0 ? (totalReads / totalRequests).toFixed(2) : '0.00';
  const quotaPercent = Math.min(100, Number(((totalReads / DAILY_FREE_READS_LIMIT) * 100).toFixed(2)));

  const storageUsedMB = storage?.totalMB || 0;
  const storagePercent = storage?.quotaPercent || Number(((storageUsedMB / SPARK_STORAGE_LIMIT_MB) * 100).toFixed(2));
  const storageBreakdown = storage?.breakdown || {};

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
            Uso real do Firebase Storage, contagem do Firestore, consumo de leituras e estado dos caches em memória.
          </p>
        </div>

        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => fetchMetrics(false, false, true)}
            disabled={refreshing}
            title="Atualizar dados do painel"
          >
            <RefreshCw size={14} className={refreshing ? styles.spinIcon : ''} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleRefreshStorage}
            disabled={recalculatingStorage}
            title="Escanear e recalcular espaço do bucket do Firebase Storage"
          >
            <Cloud size={14} className={recalculatingStorage ? styles.spinIcon : ''} />
            <span>{recalculatingStorage ? 'Escaneando...' : 'Recalcular Storage'}</span>
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
        <div className={styles.actionSuccessToast}>
          <CheckCircle2 size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className={styles.actionErrorToast}>
          <AlertTriangle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      <div className={styles.debugSection}>
        <div className={styles.debugSectionHeader}>
          <Cloud size={18} />
          <div>
            <h3 className={styles.debugSectionTitle}>Firebase Cloud Storage (Armazenamento Real)</h3>
            <p className={styles.debugSectionDesc}>
              Espaço em disco ocupado no Google Cloud Storage e cota gratuita Spark (5.0 GB).
            </p>
          </div>
        </div>

        <div className={styles.storageGrid}>
          <div className={styles.storageMainCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Espaço Utilizado</span>
              <HardDrive size={16} />
            </div>
            <div className={styles.kpiValue}>
              {storage.totalMB ? `${storage.totalMB} MB` : '0 MB'}
            </div>
            <div className={styles.quotaBarWrapper}>
              <progress
                className={styles.quotaProgress}
                value={Math.min(storageUsedMB, SPARK_STORAGE_LIMIT_MB)}
                max={SPARK_STORAGE_LIMIT_MB}
              />
            </div>
            <div className={styles.storageProgressFooter}>
              <span>{storagePercent}% da cota Spark (5.0 GB)</span>
              <span>{storage.totalGB || 0} GB / 5 GB</span>
            </div>
          </div>

          <div className={styles.storageMainCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>Total de Arquivos no Bucket</span>
              <FileBox size={16} />
            </div>
            <div className={styles.kpiValue}>
              {(storage.fileCount || 0).toLocaleString('pt-BR')}
            </div>
            <span className={styles.kpiSub}>
              Mídias originais, previews e miniaturas WebP
            </span>
          </div>
        </div>

        <div className={styles.breakdownGrid}>
          <div className={styles.breakdownCard}>
            <div className={styles.breakdownHeader}>
              <ImageIcon size={15} />
              <span>Wallpapers & Previews</span>
            </div>
            <div className={styles.breakdownValue}>
              {storageBreakdown.wallpapers?.mb || 0} MB
            </div>
            <span className={styles.breakdownSub}>
              {storageBreakdown.wallpapers?.count || 0} arquivos
            </span>
          </div>

          <div className={styles.breakdownCard}>
            <div className={styles.breakdownHeader}>
              <Sparkles size={15} />
              <span>Hero Slides</span>
            </div>
            <div className={styles.breakdownValue}>
              {storageBreakdown.heroSlides?.mb || 0} MB
            </div>
            <span className={styles.breakdownSub}>
              {storageBreakdown.heroSlides?.count || 0} arquivos
            </span>
          </div>

          <div className={styles.breakdownCard}>
            <div className={styles.breakdownHeader}>
              <Users size={15} />
              <span>Fotos de Perfil (Avatares)</span>
            </div>
            <div className={styles.breakdownValue}>
              {storageBreakdown.avatars?.mb || 0} MB
            </div>
            <span className={styles.breakdownSub}>
              {storageBreakdown.avatars?.count || 0} arquivos
            </span>
          </div>

          <div className={styles.breakdownCard}>
            <div className={styles.breakdownHeader}>
              <FileBox size={15} />
              <span>Outros Recursos</span>
            </div>
            <div className={styles.breakdownValue}>
              {storageBreakdown.other?.mb || 0} MB
            </div>
            <span className={styles.breakdownSub}>
              {storageBreakdown.other?.count || 0} arquivos
            </span>
          </div>
        </div>
      </div>

      <div className={styles.debugSection}>
        <div className={styles.debugSectionHeader}>
          <Database size={18} />
          <div>
            <h3 className={styles.debugSectionTitle}>Documentos no Firestore (Contagem Real via count())</h3>
            <p className={styles.debugSectionDesc}>
              Total exato de documentos persistidos nas coleções do banco de dados (custo de 1 leitura por agregação).
            </p>
          </div>
        </div>

        <div className={styles.firestoreStatsGrid}>
          <div className={styles.dbStatCard}>
            <span className={styles.dbStatLabel}>Total de Documentos</span>
            <span className={styles.dbStatValue}>
              {(firestoreDatabase.totalDocuments || 0).toLocaleString('pt-BR')}
            </span>
            <span className={styles.dbStatSub}>Em todas as coleções</span>
          </div>

          <div className={styles.dbStatCard}>
            <span className={styles.dbStatLabel}>Wallpapers</span>
            <span className={styles.dbStatValue}>
              {(firestoreDatabase.wallpapers || 0).toLocaleString('pt-BR')}
            </span>
            <span className={styles.dbStatSub}>Coleção 'wallpapers'</span>
          </div>

          <div className={styles.dbStatCard}>
            <span className={styles.dbStatLabel}>Usuários</span>
            <span className={styles.dbStatValue}>
              {(firestoreDatabase.users || 0).toLocaleString('pt-BR')}
            </span>
            <span className={styles.dbStatSub}>Coleção 'users'</span>
          </div>

          <div className={styles.dbStatCard}>
            <span className={styles.dbStatLabel}>Coleções</span>
            <span className={styles.dbStatValue}>
              {(firestoreDatabase.collections || 0).toLocaleString('pt-BR')}
            </span>
            <span className={styles.dbStatSub}>Coleção 'collections'</span>
          </div>

          <div className={styles.dbStatCard}>
            <span className={styles.dbStatLabel}>Hero Slides</span>
            <span className={styles.dbStatValue}>
              {(firestoreDatabase.heroSlides || 0).toLocaleString('pt-BR')}
            </span>
            <span className={styles.dbStatSub}>Coleção 'heroSlides'</span>
          </div>
        </div>
      </div>

      <div className={styles.debugSection}>
        <div className={styles.debugSectionHeader}>
          <Activity size={18} />
          <div>
            <h3 className={styles.debugSectionTitle}>Leituras do Firestore & Telemetria desta Instância</h3>
            <p className={styles.debugSectionDesc}>
              Rastreamento em tempo real do tráfego recebido e limite diário gratuito da Spark (50.000 reads/dia).
            </p>
          </div>
        </div>

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
      </div>

      <div className={styles.debugSection}>
        <div className={styles.debugSectionHeader}>
          <HardDrive size={18} />
          <div>
            <h3 className={styles.debugSectionTitle}>Estado dos Caches em Memória (Node.js)</h3>
            <p className={styles.debugSectionDesc}>
              Camadas em memória que evitam requisições ao Firestore.
            </p>
          </div>
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
              {caches.wallpapersList?.singleWallpapersCount ?? 0} únicos | {caches.wallpapersList?.userWallpapersMineCount ?? 0} privadas | {caches.wallpapersList?.userPrefsCount ?? 0} preferências
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
              <Heart size={16} fill="currentColor" />
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
              {caches.collections?.cached || (caches.collections?.slugsCount > 0) || (caches.collections?.userMineCount > 0)
                ? `${caches.collections?.itemsCount || 0} catálogo | ${caches.collections?.slugsCount || 0} slugs`
                : 'Vazio'}
            </div>
            <span className={styles.cacheCardSub}>
              {caches.collections?.userMineCount > 0 ? `${caches.collections.userMineCount} criador(es) em cache | ` : ''}TTL 10 min + Edge CDN
            </span>
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
              <span className={styles.cacheCardTitle}>Mídia HMAC</span>
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
          <div>
            <h3 className={styles.debugSectionTitle}>Consumo Detalhado por Endpoint</h3>
            <p className={styles.debugSectionDesc}>
              Rotas acessadas com contadores de requisições, leituras geradas e tempo de resposta.
            </p>
          </div>
        </div>

        {endpointList.length === 0 ? (
          <div className={styles.emptyState}>
            <Activity size={36} className={styles.emptyIcon} />
            <h4 className={styles.emptyTitle}>Nenhuma Requisição Rastreada Nesta Sessão</h4>
            <p className={styles.emptyText}>
              Navegue pela plataforma ou faça requisições à API para visualizar os reads gerados em tempo real.
            </p>
          </div>
        ) : (
          <div className={styles.endpointsTableWrapper}>
            <table className={styles.endpointsTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Rota / Endpoint</th>
                  <th>Requisições</th>
                  <th>Reads Totais</th>
                  <th>Média Reads/Req</th>
                  <th>Máx Reads</th>
                  <th>Duração Média</th>
                  <th>Último Acesso</th>
                </tr>
              </thead>
              <tbody>
                {endpointList
                  .sort((a, b) => (b.totalReads || 0) - (a.totalReads || 0))
                  .map((row) => {
                    const method = (row.method || 'GET').toUpperCase();
                    const methodClass =
                      method === 'GET'
                        ? styles.methodGet
                        : method === 'POST'
                        ? styles.methodPost
                        : method === 'PATCH'
                        ? styles.methodPatch
                        : styles.methodDelete;

                    return (
                      <tr key={row.endpoint}>
                        <td>
                          <span className={`${styles.methodBadge} ${methodClass}`}>
                            {method}
                          </span>
                        </td>
                        <td>
                          <code className={styles.endpointPath}>{row.endpoint}</code>
                        </td>
                        <td>{(row.totalRequests || 0).toLocaleString('pt-BR')}</td>
                        <td>
                          <strong>{(row.totalReads || 0).toLocaleString('pt-BR')}</strong>
                        </td>
                        <td>{(row.avgReadsPerRequest || 0).toFixed(2)}</td>
                        <td>{row.maxReads || 0}</td>
                        <td>{row.avgDurationMs ? `${row.avgDurationMs}ms` : '-'}</td>
                        <td>
                          <span className={styles.relativeTime} title={row.lastAccessed || ''}>
                            {formatRelativeTime(row.lastAccessed)}
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
