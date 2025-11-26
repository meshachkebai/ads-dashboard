import { useBrandAuth } from '../hooks/useBrandAuth';
import BrandLogin from './BrandLogin';

export default function ProtectedDashboard({ children }) {
  const { isAuthenticated, loading, login } = useBrandAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <BrandLogin onLogin={login} />;
  }

  return children;
}