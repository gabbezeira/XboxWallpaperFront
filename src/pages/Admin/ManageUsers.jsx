import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import VerifiedBadge from '../../components/VerifiedBadge';
import {
  Users,
  Search,
  Trash2,
  Copy,
  Check,
  Heart,
  Image as ImageIcon,
  Layers,
  Calendar,
  X,
} from 'lucide-react';
import styles from './styles.module.scss';

const formatDate = (dateVal) => {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState(null);
  const [selectedColId, setSelectedColId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchUsers = async (q = '') => {
    try {
      setLoading(true);
      const [usersData, colsData] = await Promise.all([
        api.admin.listUsers({ q, limit: 50 }),
        api.collections.list().catch(() => []),
      ]);
      setUsers(usersData || []);
      setCollections(colsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(searchQuery);
  };

  const handleCopyTag = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.admin.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(`Erro ao alterar cargo: ${err.message}`);
    }
  };

  const handleToggleVerified = async (userId, currentVerified) => {
    const nextVal = !currentVerified;
    try {
      await api.admin.updateUserVerification(userId, nextVal);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isVerified: nextVal } : u))
      );
    } catch (err) {
      alert(`Erro ao alterar verificação: ${err.message}`);
    }
  };

  const handleOpenAssign = (user) => {
    setUserToAssign(user);
    setSelectedColId(user.assignedCollectionId || '');
    setAssignModalOpen(true);
  };

  const handleSaveAssign = async () => {
    if (!userToAssign) return;
    try {
      setAssigning(true);
      await api.admin.assignUserCollection(userToAssign.id, selectedColId || null);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userToAssign.id ? { ...u, assignedCollectionId: selectedColId || null } : u
        )
      );
      setAssignModalOpen(false);
    } catch (err) {
      alert(`Erro ao vincular coleção: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      await api.admin.deleteUserAccount(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      alert(`Erro ao excluir conta: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader text="Carregando usuários..." />;
  }

  return (
    <div className={styles.viewContainer}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleArea}>
          <h2 className={styles.sectionTitle}>Gestão de Usuários & Criadores</h2>
          <p className={styles.sectionSubtitle}>
            Controle de cargos, atribuição de selo de criador verificado e vinculação de coleções.
          </p>
        </div>

        <div className={styles.toolbarActions}>
          <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou #tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </form>
        </div>
      </div>

      {users.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={44} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Nenhum Usuário Encontrado</h3>
          <p className={styles.emptyText}>
            {searchQuery
              ? `Nenhum usuário corresponde à busca "${searchQuery}".`
              : 'Nenhum usuário cadastrado no sistema.'}
          </p>
        </div>
      ) : (
        <>
          <div className={`${styles.tableWrapper} ${styles.desktopTableOnly}`}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Tag Única</th>
                  <th>Cadastro</th>
                  <th>Cargo</th>
                  <th>Selo Verificado</th>
                  <th>Coleção</th>
                  <th>Métricas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const assignedCol = collections.find((c) => c.id === u.assignedCollectionId);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className={styles.userCell}>
                          {u.photoURL ? (
                            <img src={u.photoURL} alt="" className={styles.userAvatar} />
                          ) : (
                            <div className={styles.userAvatarFallback}>
                              {u.displayName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className={styles.userInfoCol}>
                            <span className={styles.userNameText}>
                              {u.displayName || 'Sem Nome'}
                            </span>
                            <span className={styles.userEmailText}>
                              {u.email || 'Sem Email'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {u.userTag ? (
                          <button
                            type="button"
                            onClick={() => handleCopyTag(u.userTag, u.id)}
                            className={styles.userTagChip}
                            title="Copiar Tag"
                          >
                            <span>{u.userTag}</span>
                            {copiedId === u.id ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        ) : (
                          <span className={styles.kpiSub}>-</span>
                        )}
                      </td>

                      <td>
                        <div className={styles.statPill}>
                          <Calendar size={12} />
                          <span>{formatDate(u.createdAt)}</span>
                        </div>
                      </td>

                      <td>
                        <select
                          value={u.role || 'user'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={styles.roleSelect}
                        >
                          <option value="user">User</option>
                          <option value="creator">Creator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleVerified(u.id, u.isVerified)}
                          className={`${styles.verifyToggleBtn} ${u.isVerified ? styles.verifyActive : ''}`}
                          title={u.isVerified ? 'Remover Selo' : 'Conceder Selo'}
                        >
                          {u.isVerified ? (
                            <>
                              <VerifiedBadge size={14} />
                              <span>Verificado</span>
                            </>
                          ) : (
                            <span>Não verificado</span>
                          )}
                        </button>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => handleOpenAssign(u)}
                          className={styles.assignColBtn}
                        >
                          <Layers size={13} />
                          <span>{assignedCol ? assignedCol.name : 'Vincular'}</span>
                        </button>
                      </td>

                      <td>
                        <div className={styles.toolbarActions}>
                          <span title="Wallpapers / Cota" className={styles.statPill}>
                            <ImageIcon size={12} /> {u.imageCount || 0} / {u.maxImages || 8}
                          </span>
                          <span title="Favoritos Recebidos" className={styles.statPill}>
                            <Heart size={12} /> {u.totalFavoritesReceived || 0}
                          </span>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            setUserToDelete(u);
                            setDeleteModalOpen(true);
                          }}
                          className={styles.btnDangerIconSmall}
                          title="Excluir Usuário"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.mobileUsersGrid}>
            {users.map((u) => {
              const assignedCol = collections.find((c) => c.id === u.assignedCollectionId);
              return (
                <div key={u.id} className={styles.mobileUserCard}>
                  <div className={styles.mobileUserCardHeader}>
                    <div className={styles.userCell}>
                      {u.photoURL ? (
                        <img src={u.photoURL} alt="" className={styles.userAvatar} />
                      ) : (
                        <div className={styles.userAvatarFallback}>
                          {u.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className={styles.userInfoCol}>
                        <span className={styles.userNameText}>
                          {u.displayName || 'Sem Nome'}
                        </span>
                        <span className={styles.userEmailText}>{u.email || 'Sem Email'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserToDelete(u);
                        setDeleteModalOpen(true);
                      }}
                      className={styles.btnDangerIconSmall}
                      title="Excluir Usuário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className={styles.mobileUserCardBody}>
                    {u.userTag && (
                      <button
                        type="button"
                        onClick={() => handleCopyTag(u.userTag, u.id)}
                        className={styles.userTagChip}
                      >
                        <span>{u.userTag}</span>
                        {copiedId === u.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    )}

                    <div className={styles.statPill}>
                      <Calendar size={12} />
                      <span>{formatDate(u.createdAt)}</span>
                    </div>

                    <select
                      value={u.role || 'user'}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={styles.roleSelect}
                    >
                      <option value="user">User</option>
                      <option value="creator">Creator</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleToggleVerified(u.id, u.isVerified)}
                      className={`${styles.verifyToggleBtn} ${u.isVerified ? styles.verifyActive : ''}`}
                    >
                      {u.isVerified ? (
                        <>
                          <VerifiedBadge size={14} />
                          <span>Verificado</span>
                        </>
                      ) : (
                        <span>Não verificado</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAssign(u)}
                      className={styles.assignColBtn}
                    >
                      <Layers size={13} />
                      <span>{assignedCol ? assignedCol.name : 'Vincular'}</span>
                    </button>

                    <span className={styles.statPill}>
                      <ImageIcon size={12} /> {u.imageCount || 0} / {u.maxImages || 8}
                    </span>
                    <span className={styles.statPill}>
                      <Heart size={12} /> {u.totalFavoritesReceived || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {assignModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setAssignModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Vincular Coleção de Criador</h3>
              <button
                type="button"
                className={styles.btnIconSmall}
                onClick={() => setAssignModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.emptyText}>
                Vincule uma coleção oficial ao usuário <strong>{userToAssign?.displayName || userToAssign?.email}</strong>.
              </p>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Selecionar Coleção</label>
                <select
                  value={selectedColId}
                  onChange={(e) => setSelectedColId(e.target.value)}
                  className={styles.fieldSelect}
                >
                  <option value="">Nenhuma (Desvincular)</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setAssignModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleSaveAssign}
                disabled={assigning}
              >
                {assigning ? 'Salvando...' : 'Salvar Vínculo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Excluir Usuário</h3>
              <button
                type="button"
                className={styles.btnIconSmall}
                onClick={() => setDeleteModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.emptyText}>
                Tem certeza que deseja excluir a conta de <strong>{userToDelete?.displayName || userToDelete?.email}</strong>?
                Esta ação é irreversível e excluirá o perfil, permissões e autenticação.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleDeleteUser}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Excluir Conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
