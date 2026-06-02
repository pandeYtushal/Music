import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { FiLoader } from 'react-icons/fi';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <FiLoader className="animate-spin text-white" size={40} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

export default ProtectedRoute;
