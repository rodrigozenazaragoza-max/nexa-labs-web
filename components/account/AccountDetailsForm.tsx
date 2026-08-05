'use client';

import { useState } from 'react';
import { Loader2, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AccountDetailsForm({ initialName, initialEmail }: { initialName: string; initialEmail: string }) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const updates: { email?: string; password?: string; data?: { full_name: string } } = {
      data: { full_name: name },
    };
    if (email !== initialEmail) updates.email = email;
    if (newPassword) updates.password = newPassword;

    const { error: updateError } = await supabase.auth.updateUser(updates);
    setSaving(false);

    if (updateError) {
      setError('No pudimos guardar los cambios. Intenta de nuevo.');
      return;
    }

    setNewPassword('');
    setConfirmPassword('');
    if (email !== initialEmail) {
      setSuccess('Datos guardados. Revisa tu correo nuevo para confirmar el cambio de email.');
    } else {
      setSuccess('Tus datos se guardaron correctamente.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-theme border border-border bg-white p-6">
      <div>
        <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-ink">Perfil</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Nombre completo</label>
            <div className="flex items-center gap-2 rounded-theme border border-border px-3.5 py-2.5">
              <User size={16} className="text-muted" />
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Correo electrónico</label>
            <div className="flex items-center gap-2 rounded-theme border border-border px-3.5 py-2.5">
              <Mail size={16} className="text-muted" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full text-sm outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="mb-1 font-heading text-sm font-bold uppercase tracking-wide text-ink">Contraseña</h2>
        <p className="mb-4 text-xs text-muted">Déjalo en blanco si no quieres cambiarla.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Nueva contraseña</label>
            <div className="flex items-center gap-2 rounded-theme border border-border px-3.5 py-2.5">
              <Lock size={16} className="text-muted" />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted">Confirmar nueva contraseña</label>
            <div className="flex items-center gap-2 rounded-theme border border-border px-3.5 py-2.5">
              <Lock size={16} className="text-muted" />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full text-sm outline-none" />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="rounded-theme bg-danger-bg px-3 py-2 text-xs font-medium text-danger">{error}</p>}
      {success && (
        <p className="flex items-center gap-1.5 rounded-theme bg-primary-light px-3 py-2 text-xs font-medium text-primary-dark">
          <CheckCircle2 size={14} /> {success}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="flex items-center justify-center gap-2 rounded-theme bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-primary-dark disabled:opacity-60"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        Guardar cambios
      </button>
    </form>
  );
}
