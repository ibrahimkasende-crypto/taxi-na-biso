'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { brand } from '@/config/brand';
import { getPublicEnv } from '@/lib/env';

export function ContactForm() {
  const env = getPublicEnv();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setOk(false);
    await new Promise((r) => setTimeout(r, 400));
    if (message.trim().length < 10) {
      setError('Votre message doit contenir au moins 10 caractères.');
      setBusy(false);
      return;
    }
    setOk(true);
    setBusy(false);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={(e) => void onSubmit(e)} className="rounded-3xl bg-white p-6 shadow-card">
        <label className="block text-sm font-medium">
          Nom
          <input className="mt-1 min-h-12 w-full rounded-xl border px-3" required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="mt-4 block text-sm font-medium">
          E-mail
          <input type="email" className="mt-1 min-h-12 w-full rounded-xl border px-3" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Message
          <textarea className="mt-1 min-h-32 w-full rounded-xl border px-3 py-2" required value={message} onChange={(e) => setMessage(e.target.value)} />
        </label>
        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Envoyer'}
        </button>
        {ok ? <p className="mt-3 text-sm text-success">Message enregistré localement pour la démonstration. Utilisez aussi e-mail ou WhatsApp.</p> : null}
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </form>
      <div>
        <p className="text-sm text-muted">Assistance configurable</p>
        <p className="mt-2 font-medium">{brand.supportEmail}</p>
        <a className="mt-2 block text-brand" href={`tel:${env.supportPhone}`}>{env.supportPhone}</a>
        <a className="mt-2 block text-brand" href={`https://wa.me/${env.supportWhatsapp}`} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>
    </div>
  );
}
