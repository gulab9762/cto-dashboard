import { Zap } from 'lucide-react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import DashboardContainer from './components/DashboardContainer';
import LoginGate from './components/LoginGate';

function AppInner() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-white/5" />
          <div
            className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#3b82f6 transparent transparent transparent' }}
          />
          <Zap className="absolute inset-0 m-auto h-6 w-6 text-blue-400 animate-pulse" />
        </div>
      </div>
    );
  }

  return isAuthenticated ? <DashboardContainer /> : <LoginGate />;
}

function App() {
  return (
    <AuthProvider>
      <div id="app">
        <AppInner />
      </div>
    </AuthProvider>
  );
}

export default App;

