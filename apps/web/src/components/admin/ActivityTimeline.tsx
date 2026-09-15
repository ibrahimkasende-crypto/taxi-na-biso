'use client';

import { Bell, Car, Inbox } from 'lucide-react';

import { timeAgoFr } from '@/lib/admin-format';

type ActivityItem = {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
};

function iconFor(title: string) {
  const t = title.toLowerCase();
  if (t.includes('course') || t.includes('chauffeur')) return Car;
  if (t.includes('demande') || t.includes('booking')) return Inbox;
  return Bell;
}

function dotColor(title: string) {
  const t = title.toLowerCase();
  if (t.includes('refus')) return 'bg-red-500';
  if (t.includes('approuv') || t.includes('termin')) return 'bg-emerald-500';
  if (t.includes('nouvelle') || t.includes('demande')) return 'bg-taxi';
  return 'bg-sky-500';
}

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Aucune activité récente.</p>;
  }

  return (
    <ol className="relative space-y-0 border-l border-black/8 pl-4">
      {items.map((a, i) => {
        const Icon = iconFor(a.title);
        return (
          <li key={a.id} className={`relative pb-4 ${i === items.length - 1 ? 'pb-0' : ''}`}>
            <span
              className={`absolute -left-[1.35rem] top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white ${dotColor(a.title)} text-white shadow-sm`}
              aria-hidden
            >
              <Icon className="h-3 w-3" />
            </span>
            <p className="text-sm font-medium text-navy">{a.title}</p>
            {a.body ? <p className="mt-0.5 text-xs text-muted">{a.body}</p> : null}
            <p className="mt-1 text-[11px] text-muted">{timeAgoFr(a.created_at)}</p>
          </li>
        );
      })}
    </ol>
  );
}
