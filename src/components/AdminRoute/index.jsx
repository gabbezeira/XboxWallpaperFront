import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../Loader';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  if (user.email !== ADMIN_EMAIL) {
    return <Navigate to="/admin" replace state={{ requireAdminLogin: true }} />;
  }

  return children;
}
