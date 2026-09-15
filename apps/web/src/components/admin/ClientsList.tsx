'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { EmptyState, Skeleton } from '@/components/admin/AdminUi';
import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { openWhatsApp, whatsAppUrl } from '@/lib/whatsapp';

export function ClientsList() {
  const [rows, setRows] = useState<{ id: string; display_name: string | null; phone: string | null; email: string | null }[]>([]);
  const [requests, setRequests] = useState<{ customer_name: string; customer_phone: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = bookingDb(getSupabaseBrowser());
    async function load() {
      const [users, req] = await Promise.all([
        supabase.from('users').select('id, display_name, phone, email').eq('role', 'rider').order('created_at', { ascending: false }),
        supabase.from('booking_requests').select('customer_name, customer_phone, created_at').order('created_at', { ascending: false }).limit(40),
      ]);
      setRows((users.data as typeof rows) ?? []);
      setRequests((req.data as typeof requests) ?? []);
      setLoading(false);
    }
    void load();
  }, []);

  if (loading) return <Skeleton className="h-64" />;

  const extras = requests.filter((r) => !rows.some((u) => u.phone && r.customer_phone.includes(u.phone.replace(/\D/g, '').slice(-9))));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Clients</h1>
      {rows.length === 0 && extras.length === 0 ? (
        <EmptyState>Aucun client.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${u.id}`} className="font-medium hover:underline">
                      {u.display_name || 'Client'}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{u.phone ?? '—'}</td>
                  <td className="px-4 py-3">{u.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    {u.phone ? (
                      <button
                        type="button"
                        className="text-sm text-navy underline"
                        onClick={() =>
                          openWhatsApp(
                            whatsAppUrl(u.phone!, `Bonjour ${u.display_name || ''}, nous vous contactons concernant TAXI NA BISO.`),
                          )
                        }
                      >
                        WhatsApp
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {extras.slice(0, 12).map((r, i) => (
                <tr key={`${r.customer_phone}-${i}`} className="border-t">
                  <td className="px-4 py-3">{r.customer_name}</td>
                  <td className="px-4 py-3">{r.customer_phone}</td>
                  <td className="px-4 py-3 text-muted">Demande publique</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-sm underline"
                      onClick={() =>
                        openWhatsApp(whatsAppUrl(r.customer_phone, `Bonjour ${r.customer_name}, nous vous contactons concernant TAXI NA BISO.`))
                      }
                    >
                      WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
