'use client';
import { useActionState } from 'react';
import { login } from '../actions';

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="stack">
      <label className="field">
        <span>Senha</span>
        <input className="input" type="password" name="password" autoComplete="current-password" required autoFocus />
      </label>
      {error && <p className="notice danger" style={{ margin: 0 }}>{error}</p>}
      <button className="btn gold block" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</button>
    </form>
  );
}
