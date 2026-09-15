'use client';

import { useState } from 'react';

import { getPublicEnv } from '@/lib/env';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function AssistancePage() {
  const env = getPublicEnv();
  const [text, setText] = useState('');
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(): Promise<void> {
    setError(null);
    const supabase = getSupabaseBrowser();
    const { data } = await supabase.auth.getUser();
    const id = data.user?.id;
    if (!id) return;
    const { error: err } = await supabase.from('incident_reports').insert({
      reported_by: id,
      driver_id: id,
      category: 'other',
      severity: 'low',
      description: text.trim(),
    });
    if (err) setError(err.message);
    else setOk(true);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Assistance</h1>
      <a className="block text-brand" href={`tel:${env.supportPhone}`}>
        Appeler {env.supportPhone}
      </a>
      <a className="block text-brand" href={`https://wa.me/${env.supportWhatsapp}`} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <textarea
        className="min-h-32 w-full rounded-xl border p-3"
        placeholder="Signaler un incident…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="button"
        disabled={text.trim().length < 5}
        onClick={() => void submit()}
        className="min-h-12 w-full rounded-xl bg-brand font-semibold text-white disabled:opacity-50"
      >
        Envoyer
      </button>
      {ok ? <p className="text-success">Signalement envoyé.</p> : null}
      {error ? <p className="text-danger text-sm">{error}</p> : null}
    </div>
  );
}
