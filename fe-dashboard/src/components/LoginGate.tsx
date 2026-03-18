import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { type FC, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const LoginGate: FC = () => {
  const { login } = useAuth();
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#09090b' }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-500/8 blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[50%] rounded-full bg-violet-500/8 blur-[160px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div
          className="rounded-3xl border border-white/10 backdrop-blur-xl p-10"
          style={{ background: 'rgba(255,255,255,0.03)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, type: 'spring', damping: 14 }}
            className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/12 border border-blue-500/20 mx-auto mb-6"
            style={{ boxShadow: '0 0 32px rgba(59,130,246,0.2)' }}
          >
            <Zap className="w-8 h-8 text-blue-400" />
          </motion.div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-white">
              CTO OS <span className="text-blue-400 font-light">1.0</span>
            </h1>
            <p className="text-sm text-white/35 mt-1 font-medium">Engineering intelligence</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                Username
              </label>
              <input
                id="username-input"
                type="text"
                autoComplete="username"
                autoFocus
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 bg-white/5 border border-white/10 focus:border-blue-500/50 focus:ring-0 focus:outline-none transition-colors duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 bg-white/5 border border-white/10 focus:border-blue-500/50 focus:outline-none transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-400 text-xs bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              id="login-btn"
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="group relative w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wider text-white overflow-hidden disabled:opacity-60 transition-opacity"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                boxShadow: '0 6px 24px rgba(59,130,246,0.3)',
              }}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-400 rounded-xl" />
              {loading ? (
                <div className="relative z-10 h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <LogIn className="relative z-10 w-4 h-4" />
                  <span className="relative z-10">Sign In</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Hint */}
          <p className="text-center text-xs text-white/20 mt-6">
            Default: <span className="text-white/40 font-mono">admin / admin123</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginGate;
