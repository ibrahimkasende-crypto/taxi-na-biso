'use client';

import { useState } from 'react';

import { getSupabaseBrowser } from '@/lib/supabase-browser';

const DOC_TYPES = [
  { id: 'licence_front', label: 'Permis (recto)' },
  { id: 'licence_back', label: 'Permis (verso)' },
  { id: 'photo', label: 'Photo' },
  { id: 'authority', label: 'Autorisation' },
  { id: 'medical_cert', label: 'Certificat médical' },
  { id: 'other', label: 'Autre' },
] as const;

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'application/pdf']);

export function DocumentUpload({ driverId }: { driverId: string }) {
  const [docType, setDocType] = useState<(typeof DOC_TYPES)[number]['id']>('licence_front');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onFile(file: File | undefined): Promise<void> {
    if (!file) return;
    setError(null);
    setOk(false);
    if (!ALLOWED.has(file.type)) {
      setError('Formats acceptés : JPEG, PNG, PDF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Fichier trop volumineux (5 Mo max).');
      return;
    }
    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      const ext = file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : 'jpg';
      const path = `${driverId}/${docType}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('driver-documents').upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { error: rowErr } = await supabase.from('driver_documents').insert({
        driver_id: driverId,
        doc_type: docType,
        storage_path: path,
        status: 'pending',
      });
      if (rowErr) throw rowErr;
      setOk(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl bg-white p-4 shadow-card">
      <h2 className="font-semibold">Déposer un document</h2>
      <p className="mt-1 text-xs text-muted">
        Bucket privé uniquement. Les pièces d’identité ne sont jamais publiques.
      </p>
      <label className="mt-3 block text-sm">
        Type
        <select
          className="mt-1 min-h-11 w-full rounded-xl border px-3"
          value={docType}
          onChange={(e) => setDocType(e.target.value as (typeof DOC_TYPES)[number]['id'])}
        >
          {DOC_TYPES.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </label>
      <input
        className="mt-3 w-full text-sm"
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        disabled={busy}
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      {ok ? <p className="mt-2 text-sm text-success">Document envoyé, en attente de validation.</p> : null}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
