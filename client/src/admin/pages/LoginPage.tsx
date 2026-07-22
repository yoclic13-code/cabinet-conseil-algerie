import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { AdminButton, AdminInput, ErrorBanner } from '../components/ui';
import { ApiError } from '../../api/client';

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@cabinet-conseil.dz');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-admin-bg px-4 font-sans">
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="w-full max-w-sm rounded-lg border border-admin-border bg-white p-6 shadow-sm"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-admin-mute">
          Administration
        </p>
        <h1 className="mt-1 text-lg font-semibold text-admin-ink">Connexion</h1>
        <p className="mt-1 text-sm text-admin-mute">Accès réservé aux super-admins.</p>

        <div className="mt-6 space-y-3">
          {error ? <ErrorBanner message={error} /> : null}
          <AdminInput
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AdminInput
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <AdminButton type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Connexion…' : 'Se connecter'}
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
