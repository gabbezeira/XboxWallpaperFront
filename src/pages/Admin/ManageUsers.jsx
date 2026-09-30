import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import {
  Users,
  Search,
  CheckCircle,
  Shield,
  Palette,
  Trash2,
  Copy,
  Check,
  Heart,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import styles from './styles.module.scss';

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
      await api.admin.updateRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(`Erro ao alterar cargo: ${err.message}`);
    }
  };

  const handleToggleVerified = async (userId, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      await api.admin.updateVerification(userId, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isVerified: nextStatus } : u))
      );
    } catch (err) {
      alert(`Erro ao alterar verificado: ${err.message}`);
    }
  };

  const handleOpenAssign = (user) => {
    setUserToAssign(user);
    setSelectedColId(user.assignedCollectionId || '');
    setAssignModalOpen(true);
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!userToAssign) return;
    setAssigning(true);
    try {
      await api.admin.assignCollection(userToAssign.id, selectedColId || null);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userToAssign.id ? { ...u, assignedCollectionId: selectedColId || null } : u
        )
      );
      setAssignModalOpen(false);
      setUserToAssign(null);
    } catch (err) {
      alert(`Erro ao associar coleção: ${err.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await api.admin.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      alert(`Erro ao excluir usuário: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.usersSection}>
      <div className={styles.usersHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Gestão de Usuários & Creators</h2>
          <p className={styles.sectionSubtitle}>
            Localize usuários pela Tag Discord (#1234), conceda cargos, selos de verificação e associe coleções.
          </p>
        </div>
        <form onSubmit={handleSearchSubmit} className={styles.userSearchForm}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nome, email ou Tag (#1234)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button type="submit" className={styles.btnSecondary}>
            Buscar
          </button>
        </form>
      </div>

      {loading ? (
        <div className={styles.loadRow}>
          <Loader />
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyQueue}>
          <Users size={40} className={styles.emptyQueueIcon} />
          <h3 className={styles.emptyQueueTitle}>Nenhum usuário encontrado</h3>
          <p className={styles.emptyQueueText}>Tente refinar sua busca por nome ou #tag.</p>
        </div>
      ) : (
        <div className={styles.usersTableWrapper}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Tag Discord</th>
                <th>Cargo</th>
                <th>Selo</th>
                <th>Coleção Oficial</th>
                <th>Estatísticas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const assignedCol = collections.find((c) => c.id === u.assignedCollectionId);
                return (
                  <tr key={u.id} className={styles.userRow}>
                    <td>
                      <div className={styles.userCell}>
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" className={styles.userTableAvatar} />
                        ) : (
                          <div className={styles.userTablePlaceholder}>
                            {u.displayName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className={styles.userNameBlock}>
                          <span className={styles.userTableName}>
                            {u.displayName || 'Sem Nome'}
                          </span>
                          <span className={styles.userTableEmail}>{u.email || 'Sem Email'}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {u.userTag ? (
                        <button
                          type="button"
                          onClick={() => handleCopyTag(u.userTag, u.id)}
                          className={styles.tagCopyBtn}
                          title="Clique para copiar"
                        >
                          <span>{u.userTag}</span>
                          {copiedId === u.id ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      ) : (
                        <span className={styles.dimmedText}>-</span>
                      )}
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
                        className={`${styles.verifyBtn} ${u.isVerified ? styles.verifyBtnActive : ''}`}
                        title={u.isVerified ? 'Remover Selo Verificado' : 'Conceder Selo Verificado'}
                      >
                        <CheckCircle size={15} />
                        <span>{u.isVerified ? 'Verificado' : 'Não verificado'}</span>
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
                      <div className={styles.userStatsCell}>
                        <span title="Wallpapers / Cota" className={styles.statPill}>
                          <ImageIcon size={12} /> {u.imageCount || 0} / {u.maxImages || 10}
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
                        className={styles.btnDangerSmall}
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
      )}

      {assignModalOpen && userToAssign && (
        <div className={styles.modalOverlay}>
          <div className={styles.rejectModal}>
            <h3 className={styles.modalTitle}>Vincular Coleção a {userToAssign.displayName}</h3>
            <p className={styles.modalDesc}>
              Ao vincular uma coleção a este usuário, ela funcionará como a Playlist oficial dele.
            </p>
            <form onSubmit={handleSaveAssignment}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Selecionar Coleção:</label>
                <select
                  value={selectedColId}
                  onChange={(e) => setSelectedColId(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="">-- Nenhuma (Desvincular) --</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (/c/{c.slug})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.modalButtons}>
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className={styles.btnGhost}
                  disabled={assigning}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={assigning}
                >
                  {assigning ? 'Salvando...' : 'Salvar Associação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModalOpen && userToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          title="Confirmar Exclusão de Conta"
          message={`Tem certeza que deseja excluir o usuário "${userToDelete.displayName}" (${userToDelete.email})? Todos os seus wallpapers e arquivos no Storage serão removidos permanentemente.`}
          variant="danger"
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
}
