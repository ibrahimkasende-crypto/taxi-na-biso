'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export function DemandesNavLink() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const supabase = bookingDb(getSupabaseBrowser());
    async function load() {
      const { count } = await supabase
        .from('booking_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setPending(count ?? 0);
    }
    void load();
    const channel = supabase
      .channel('booking_requests_badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, () => {
        void load();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Link href="/admin/demandes" className="flex items-center justify-between rounded px-3 py-2 text-sm hover:bg-gray-100">
      <span>Demandes de courses</span>
      {pending > 0 ? (
        <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">{pending}</span>
      ) : null}
    </Link>
  );
}
