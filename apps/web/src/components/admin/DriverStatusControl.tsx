'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { AdminModal } from '@/components/admin/AdminUi';
import { showAdminToast } from '@/components/admin/AdminShell';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export function DriverStatusControl({ driverId, status }: { driverId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function setStatus(next: 'approved' | 'suspended'): Promise<void> {
    setBusy(true);
    try {
      const { error } = await getSupabaseBrowser().from('driver_profiles').update({ status: next }).eq('user_id', driverId);
      if (error) {
        showAdminToast('Impossible de modifier ce chauffeur.');
        return;
      }
      showAdminToast(next === 'suspended' ? 'Chauffeur suspendu' : 'Chauffeur approuvé');
      router.refresh();
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }

  return (
    <div className="flex gap-2">
      {status !== 'approved' ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void setStatus('approved')}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          Approuver
        </button>
      ) : null}
      {status !== 'suspended' ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => setConfirm(true)}
          className="rounded-xl bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-60"
        >
          Suspendre
        </button>
      ) : null}
      {confirm ? (
        <AdminModal title="Suspendre ce chauffeur ?" onClose={() => setConfirm(false)}>
          <p className="text-sm text-muted">Il ne pourra plus recevoir de courses tant qu’il est suspendu.</p>
          <div className="mt-4 flex gap-2">
            <button type="button" className="min-h-11 flex-1 rounded-xl bg-red-600 text-white" onClick={() => void setStatus('suspended')}>
              Confirmer
            </button>
            <button type="button" className="min-h-11 flex-1 rounded-xl border" onClick={() => setConfirm(false)}>
              Annuler
            </button>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}
