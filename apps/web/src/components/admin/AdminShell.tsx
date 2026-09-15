'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Car,
  Users,
  UserRound,
  Wallet,
  BarChart3,
  MessageSquare,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
} from 'lucide-react';

import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { timeAgoFr } from '@/lib/admin-format';

export function showAdminToast(message: string) {
  window.dispatchEvent(new CustomEvent('tnb:toast', { detail: message }));
}

const NAV = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/demandes', label: 'Demandes de courses', icon: Inbox, badgeKey: 'pending' as const },
  { href: '/admin/courses', label: 'Courses', icon: Car, badgeKey: 'active' as const },
  { href: '/admin/chauffeurs', label: 'Chauffeurs', icon: Users },
  { href: '/admin/clients', label: 'Clients', icon: UserRound },
  { href: '/admin/vehicules', label: 'Véhicules', icon: Car },
  { href: '/admin/revenus', label: 'Revenus', icon: Wallet },
  { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare, badgeKey: 'messages' as const },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
];

type SearchHit = { href: string; title: string; subtitle: string; kind: string };

export function AdminShell({
  children,
  email,
  name,
}: {
  children: React.ReactNode;
  email: string;
  name: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [badges, setBadges] = useState({ pending: 0, active: 0, messages: 0, notif: 0 });
  const [notifs, setNotifs] = useState<{ id: string; title: string; body: string | null; href: string | null; created_at: string; read_at: string | null }[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const supabase = bookingDb(getSupabaseBrowser());
    async function load() {
      const [pending, active, unreadNotif, notifRows] = await Promise.all([
        supabase.from('booking_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('trips').select('*', { count: 'exact', head: true }).in('status', [
          'requested',
          'scheduled',
          'assigned',
          'driver_en_route',
          'arrived_at_pickup',
          'in_progress',
        ]),
        supabase.from('admin_notifications').select('*', { count: 'exact', head: true }).is('read_at', null),
        supabase.from('admin_notifications').select('id, title, body, href, created_at, read_at').order('created_at', { ascending: false }).limit(8),
      ]);
      setBadges({
        pending: pending.count ?? 0,
        active: active.count ?? 0,
        messages: 0,
        notif: unreadNotif.count ?? 0,
      });
      setNotifs((notifRows.data as typeof notifs) ?? []);
    }
    void load();
    const channel = supabase
      .channel('admin-shell')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'booking_requests' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notifications' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trips' }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const onToast = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      setToast(msg);
      window.setTimeout(() => setToast(null), 2800);
    };
    window.addEventListener('tnb:toast', onToast);
    return () => window.removeEventListener('tnb:toast', onToast);
  }, []);

  useEffect(() => {
    if (!q.trim()) return;
    const timer = window.setTimeout(async () => {
      const supabase = bookingDb(getSupabaseBrowser());
      const term = q.trim();
      const [req, users, veh] = await Promise.all([
        supabase.from('booking_requests').select('id, reference, customer_name').or(`reference.ilike.%${term}%,customer_name.ilike.%${term}%`).limit(5),
        supabase.from('users').select('id, display_name, phone, role').or(`display_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%`).limit(6),
        supabase.from('vehicles').select('id, make, model, rego').or(`rego.ilike.%${term}%,model.ilike.%${term}%`).limit(4),
      ]);
      const next: SearchHit[] = [];
      for (const r of (req.data as { id: string; reference: string; customer_name: string }[]) ?? []) {
        next.push({ href: `/admin/demandes/${r.id}`, title: r.reference, subtitle: r.customer_name, kind: 'Course' });
      }
      for (const u of (users.data as { id: string; display_name: string | null; role: string; phone: string | null }[]) ?? []) {
        const href = u.role === 'driver' ? `/admin/chauffeurs/${u.id}` : `/admin/clients/${u.id}`;
        next.push({ href, title: u.display_name || 'Sans nom', subtitle: u.phone || u.role, kind: u.role === 'driver' ? 'Chauffeur' : 'Client' });
      }
      for (const v of (veh.data as { id: string; make: string; model: string; rego: string }[]) ?? []) {
        next.push({ href: `/admin/vehicules/${v.id}`, title: v.rego, subtitle: `${v.make} ${v.model}`, kind: 'Véhicule' });
      }
      setHits(next.slice(0, 8));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [q]);

  const initials = useMemo(() => name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'AD', [name]);

  async function markAllRead() {
    await bookingDb(getSupabaseBrowser()).rpc('admin_mark_notifications_read');
    setBellOpen(false);
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-navy text-white">
      <Link href="/admin" className="flex items-center gap-2 px-4 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/branding/logo-on-dark.png" alt="Taxi Na Biso" className="h-9 w-auto max-w-[180px] object-contain" />
      </Link>
      <p className="px-4 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Administration</p>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4" aria-label="Navigation administration">
        {NAV.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          const Icon = item.icon;
          const count = item.badgeKey ? badges[item.badgeKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium ${
                active ? 'bg-taxi text-navy' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </span>
              {count > 0 ? (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? 'bg-navy text-taxi' : 'bg-taxi text-navy'}`}>
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/admin/admin-avatar.jpeg" alt="" className="h-10 w-10 rounded-full object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Admin</p>
            <p className="truncate text-xs text-white/50">{email}</p>
          </div>
        </div>
        <button
          type="button"
          className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10"
          onClick={async () => {
            await getSupabaseBrowser().auth.signOut();
            window.location.href = '/admin/login';
          }}
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-navy">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 lg:block">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-navy/50" aria-label="Fermer le menu" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72">{sidebar}</div>
        </div>
      ) : null}

      <div className="lg:pl-56">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-black/5 bg-white/95 px-4 py-3 backdrop-blur">
          <button type="button" className="rounded-xl border p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une course, un client, un chauffeur..."
              className="min-h-11 w-full rounded-xl border border-black/10 bg-[#F7F8FA] pl-10 pr-3 text-sm outline-none focus:border-taxi focus:ring-2 focus:ring-taxi/30"
            />
            {q.trim() && hits.length > 0 ? (
              <ul className="absolute z-40 mt-1 w-full overflow-hidden rounded-2xl border bg-white shadow-lg">
                {hits.map((h) => (
                  <li key={h.href + h.title}>
                    <button
                      type="button"
                      className="flex w-full items-start justify-between px-3 py-2 text-left hover:bg-taxi/20"
                      onClick={() => {
                        router.push(h.href);
                        setQ('');
                        setHits([]);
                      }}
                    >
                      <span>
                        <span className="block text-sm font-medium">{h.title}</span>
                        <span className="text-xs text-muted">{h.subtitle}</span>
                      </span>
                      <span className="text-[11px] text-muted">{h.kind}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="relative">
            <button type="button" className="relative rounded-xl border p-2" onClick={() => setBellOpen((v) => !v)} aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {badges.notif > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-taxi px-1.5 text-[10px] font-bold text-navy">{badges.notif}</span>
              ) : null}
            </button>
            {bellOpen ? (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border bg-white p-3 shadow-xl">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Notifications</p>
                  <button type="button" className="text-xs text-muted" onClick={() => void markAllRead()}>
                    Tout marquer comme lu
                  </button>
                </div>
                {notifs.length === 0 ? (
                  <p className="text-sm text-muted">Aucune notification.</p>
                ) : (
                  <ul className="space-y-2">
                    {notifs.map((n) => (
                      <li key={n.id}>
                        <Link href={n.href || '/admin'} className="block rounded-xl px-2 py-1.5 hover:bg-[#F7F8FA]" onClick={() => setBellOpen(false)}>
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-muted">{n.body} · {timeAgoFr(n.created_at)}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
          <Link href="/admin/profil" className="hidden items-center gap-2 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-taxi text-xs font-bold text-navy">{initials}</span>
            <span className="text-left">
              <span className="block text-sm font-semibold">Admin</span>
              <span className="block text-xs text-muted">Administrateur</span>
            </span>
          </Link>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      {toast ? (
        <div className="fixed bottom-4 right-4 z-[90] rounded-xl bg-navy px-4 py-3 text-sm text-white shadow-lg">{toast}</div>
      ) : null}
    </div>
  );
}
