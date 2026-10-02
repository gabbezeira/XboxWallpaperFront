import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import {
  Layers,
  Search,
  ArrowRight,
  User,
  KeyRound,
  Copy,
  Check,
  Compass,
} from 'lucide-react';
import styles from './styles.module.scss';

export default function Collections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickCode, setQuickCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const data = await api.collections.list();
        if (isMounted) {
          setCollections(data || []);
        }
      } catch (err) {
        if (isMounted) console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCollections();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickCodeSubmit = (e) => {
    e.preventDefault();
    const clean = quickCode.trim();
    if (!clean) {
      setCodeError('Digite o código ou slug da coleção.');
      return;
    }
    setCodeError('');
    navigate(`/collection/${encodeURIComponent(clean)}`);
  };

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase().trim();
    return collections.filter((c) => {
      const nameMatch = c.name?.toLowerCase().includes(q);
      const slugMatch = c.slug?.toLowerCase().includes(q);
      const codeMatch = c.code?.toLowerCase().includes(q);
      const creatorMatch = c.creatorName?.toLowerCase().includes(q);
      const descMatch = c.description?.toLowerCase().includes(q);
      return nameMatch || slugMatch || codeMatch || creatorMatch || descMatch;
    });
  }, [collections, searchQuery]);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.headerBadge}>
            <Layers size={16} />
            <span>Catálogo Comunitário</span>
          </div>
          <h1 className={styles.title}>Coleções Oficiais</h1>
          <p className={styles.subtitle}>
            Explore coleções temáticas criadas por artistas e membros da comunidade. Digite um código de acesso rápido ou busque pelo acervo desejado.
          </p>
          <div className={styles.divider} />
        </header>

        <section className={styles.quickAccessCard}>
          <div className={styles.quickAccessHeader}>
            <div className={styles.quickAccessIconBox}>
              <KeyRound size={22} />
            </div>
            <div className={styles.quickAccessText}>
              <h2 className={styles.quickAccessTitle}>Acesso Rápido por Código</h2>
              <p className={styles.quickAccessDesc}>
                Tem o código de uma coleção compartilhada por um criador? Digite abaixo para ir direto sem precisar de URLs longas.
              </p>
            </div>
          </div>

          <form className={styles.quickAccessForm} onSubmit={handleQuickCodeSubmit}>
            <div className={styles.quickInputWrapper}>
              <input
                type="text"
                placeholder="Ex: XB-HALO, FORZA, CYBERPUNK..."
                value={quickCode}
                onChange={(e) => {
                  setQuickCode(e.target.value.toUpperCase());
                  if (codeError) setCodeError('');
                }}
                className={styles.quickInput}
                maxLength={24}
              />
            </div>
            <button type="submit" className={styles.btnQuickSubmit} tabIndex={0}>
              <span>Acessar Coleção</span>
              <ArrowRight size={18} />
            </button>
          </form>
          {codeError && <span className={styles.codeErrorText}>{codeError}</span>}
        </section>

        <div className={styles.searchBarSection}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Filtrar por nome, criador ou código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <span className={styles.resultsCount}>
            {filteredCollections.length}{' '}
            {filteredCollections.length === 1 ? 'coleção encontrada' : 'coleções encontradas'}
          </span>
        </div>

        {loading ? (
          <Loader text="Carregando coleções..." />
        ) : filteredCollections.length > 0 ? (
          <div className={styles.collectionsGrid}>
            {filteredCollections.map((col) => {
              const displayCode = col.code || col.slug?.toUpperCase() || `COL-${col.id.slice(0, 5).toUpperCase()}`;
              const isCopied = copiedCode === displayCode;

              return (
                <div
                  key={col.id}
                  className={styles.collectionCard}
                  onClick={() => navigate(`/collection/${col.slug || col.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/collection/${col.slug || col.id}`);
                    }
                  }}
                >
                  <div className={styles.cardBannerArea}>
                    {col.bannerUrl ? (
                      <img src={col.bannerUrl} alt={col.name} className={styles.cardBannerImg} />
                    ) : (
                      <div className={styles.cardBannerFallback}>
                        <Layers size={36} />
                      </div>
                    )}
                    <div className={styles.cardBannerGradient} />
                    <button
                      type="button"
                      className={styles.codePillButton}
                      onClick={(e) => handleCopyCode(e, displayCode)}
                      title="Copiar código da coleção"
                      tabIndex={0}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{isCopied ? 'Copiado!' : displayCode}</span>
                    </button>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardMetaRow}>
                      {col.creatorName ? (
                        <span className={styles.creatorPill}>
                          <User size={12} />
                          <span>{col.creatorName}</span>
                        </span>
                      ) : (
                        <span className={styles.officialPill}>Oficial</span>
                      )}
                    </div>

                    <h3 className={styles.cardTitle}>{col.name}</h3>

                    {col.description && (
                      <p className={styles.cardDesc}>{col.description}</p>
                    )}

                    <div className={styles.cardFooter}>
                      <span className={styles.viewLink}>
                        Explorar
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconBox}>
              <Compass size={32} />
            </div>
            <h3 className={styles.emptyTitle}>Nenhuma coleção encontrada</h3>
            <p className={styles.emptyDesc}>
              Não localizamos nenhuma coleção com os termos digitados. Tente buscar por outro nome ou utilize o código de acesso rápido.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
