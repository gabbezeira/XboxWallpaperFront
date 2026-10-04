import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';
import UserAvatar from '../../components/UserAvatar';
import VerifiedBadge from '../../components/VerifiedBadge';
import AdminHeader from './components/AdminHeader';
import AdminSearch from './components/AdminSearch';
import AdminModal from './components/AdminModal';
import AdminBadge from './components/AdminBadge';
import {
  Users,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Calendar,
  Layers,
  Image as ImageIcon,
  Heart,
  AlertCircle,
} from 'lucide-react';
import styles from './ManageUsers.module.scss';

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
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState(null);
  const [selectedColId, setSelectedColId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchUsers = useCallback(async (q = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, colsRes] = await Promise.all([
        api.admin.listUsers({ q, page, limit: 15 }),
        api.collections.list().catch(() => []),
      ]);
      const list = usersRes?.users || (Array.isArray(usersRes) ? usersRes : []);
      setUsers(list);
      setTotalPages(usersRes?.totalPages || 1);
      setTotalUsers(usersRes?.total ?? list.length);
      setCurrentPage(usersRes?.page || page);
      setCollections(Array.isArray(colsRes) ? colsRes : []);
    } catch (err) {
      console.error('fetchUsers error:', err);
      setError(err.message || 'Erro ao carregar lista de usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(searchQuery, 1);
  }, [fetchUsers]);

  const handlePageChange = (newPage) => {
    fetchUsers(searchQuery, newPage);
  };

  const handleSearchSubmit = (val) => {
    fetchUsers(val, 1);
  };

  const handleRefresh = () => {
    fetchUsers(searchQuery, currentPage);
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
          u.id === userToAssign.id
            ? { ...u, assignedCollectionId: selectedColId || null }
            : u
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
      setTotalUsers((prev) => Math.max(0, prev - 1));
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      alert(`Erro ao excluir conta: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading && users.length === 0) {
    return <Loader text="Carregando usuários..." />;
  }

  return (
    <div className={styles.container}>
      <AdminHeader
        title="Gestão de Usuários & Criadores"
        subtitle="Controle de cargos, permissões, atribuição de selo de criador verificado e vinculação de coleções."
        badge={totalUsers}
      >
        <div className={styles.toolbar}>
          <AdminSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            placeholder="Buscar por nome, e-mail ou #tag..."
          />
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={handleRefresh}
            title="Atualizar lista"
          >
            <RefreshCw size={14} />
            <span>Atualizar</span>
          </button>
        </div>
      </AdminHeader>

      {error && (
        <div className={styles.errorAlert}>
          <div className={styles.errorAlertContent}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleRefresh}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!error && users.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={40} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Nenhum Usuário Encontrado</h3>
          <p className={styles.emptySubtitle}>
            {searchQuery
              ? `Nenhum usuário corresponde à busca "${searchQuery}".`
              : 'Nenhum usuário cadastrado no sistema.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                setSearchQuery('');
                fetchUsers('', 1);
              }}
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : !error && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
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
                  const assignedCol = collections.find(
                    (c) => c.id === u.assignedCollectionId
                  );
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className={styles.userCell}>
                          <UserAvatar
                            photoUrl={u.photoURL}
                            name={u.displayName || u.email || 'Usuário'}
                            size="small"
                          />
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>
                              {u.displayName || 'Sem Nome'}
                            </span>
                            <span className={styles.userEmail}>
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
                            className={styles.copyTagBtn}
                            title="Copiar Tag"
                          >
                            <span>{u.userTag}</span>
                            {copiedId === u.id ? (
                              <Check size={12} />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        ) : (
                          <span className={styles.userEmail}>-</span>
                        )}
                      </td>

                      <td>
                        <AdminBadge icon={Calendar}>
                          {formatDate(u.createdAt)}
                        </AdminBadge>
                      </td>

                      <td>
                        <select
                          value={u.role || 'user'}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value)
                          }
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
                          onClick={() =>
                            handleToggleVerified(u.id, u.isVerified)
                          }
                          className={`${styles.verifyBtn} ${
                            u.isVerified ? styles.verifyBtnActive : ''
                          }`}
                          title={
                            u.isVerified
                              ? 'Remover Selo'
                              : 'Conceder Selo'
                          }
                        >
                          {u.isVerified ? (
                            <>
                              <VerifiedBadge size={13} />
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
                          className={styles.assignBtn}
                        >
                          <Layers size={13} />
                          <span>
                            {assignedCol ? assignedCol.name : 'Vincular'}
                          </span>
                        </button>
                      </td>

                      <td>
                        <div className={styles.metricsCell}>
                          <AdminBadge icon={ImageIcon}>
                            {u.imageCount || 0} / {u.maxImages || 8}
                          </AdminBadge>
                          <AdminBadge icon={Heart}>
                            {u.totalFavoritesReceived || 0}
                          </AdminBadge>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            setUserToDelete(u);
                            setDeleteModalOpen(true);
                          }}
                          className={styles.deleteBtn}
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

          <div className={styles.mobileCards}>
            {users.map((u) => {
              const assignedCol = collections.find(
                (c) => c.id === u.assignedCollectionId
              );
              return (
                <div key={u.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <div className={styles.userCell}>
                      <UserAvatar
                        photoUrl={u.photoURL}
                        name={u.displayName || u.email || 'Usuário'}
                        size="small"
                      />
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>
                          {u.displayName || 'Sem Nome'}
                        </span>
                        <span className={styles.userEmail}>
                          {u.email || 'Sem Email'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserToDelete(u);
                        setDeleteModalOpen(true);
                      }}
                      className={styles.deleteBtn}
                      title="Excluir Usuário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className={styles.mobileCardBody}>
                    {u.userTag && (
                      <button
                        type="button"
                        onClick={() => handleCopyTag(u.userTag, u.id)}
                        className={styles.copyTagBtn}
                      >
                        <span>{u.userTag}</span>
                        {copiedId === u.id ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    )}

                    <AdminBadge icon={Calendar}>
                      {formatDate(u.createdAt)}
                    </AdminBadge>

                    <select
                      value={u.role || 'user'}
                      onChange={(e) =>
                        handleRoleChange(u.id, e.target.value)
                      }
                      className={styles.roleSelect}
                    >
                      <option value="user">User</option>
                      <option value="creator">Creator</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleVerified(u.id, u.isVerified)
                      }
                      className={`${styles.verifyBtn} ${
                        u.isVerified ? styles.verifyBtnActive : ''
                      }`}
                    >
                      {u.isVerified ? (
                        <>
                          <VerifiedBadge size={13} />
                          <span>Verificado</span>
                        </>
                      ) : (
                        <span>Não verificado</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAssign(u)}
                      className={styles.assignBtn}
                    >
                      <Layers size={13} />
                      <span>
                        {assignedCol ? assignedCol.name : 'Vincular Coleção'}
                      </span>
                    </button>

                    <AdminBadge icon={ImageIcon}>
                      {u.imageCount || 0} / {u.maxImages || 8}
                    </AdminBadge>
                    <AdminBadge icon={Heart}>
                      {u.totalFavoritesReceived || 0}
                    </AdminBadge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.paginationContainer}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      <AdminModal
        isOpen={assignModalOpen}
        title="Vincular Coleção ao Usuário"
        onClose={() => setAssignModalOpen(false)}
        footer={
          <>
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
          </>
        }
      >
        <p className={styles.modalText}>
          Vincule uma coleção ao usuário{' '}
          <strong>
            {userToAssign?.displayName || userToAssign?.email}
          </strong>
          .
        </p>
        <div className={styles.formGroup}>
          <label className={styles.fieldLabel}>Coleção</label>
          <select
            value={selectedColId}
            onChange={(e) => setSelectedColId(e.target.value)}
            className={styles.select}
          >
            <option value="">Nenhuma (Desvincular)</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={deleteModalOpen}
        title="Excluir Conta de Usuário"
        onClose={() => setDeleteModalOpen(false)}
        footer={
          <>
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
          </>
        }
      >
        <p className={styles.modalText}>
          Tem certeza de que deseja excluir a conta de{' '}
          <strong>
            {userToDelete?.displayName || userToDelete?.email}
          </strong>
          ? Esta ação é irreversível e excluirá o perfil, permissões e autenticação.
        </p>
      </AdminModal>
    </div>
  );
}
