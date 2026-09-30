import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../Loader';

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace state={{ requireAdminLogin: true }} />;
  }

  return children;
}
