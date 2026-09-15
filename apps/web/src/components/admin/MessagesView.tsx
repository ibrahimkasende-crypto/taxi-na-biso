'use client';

import { useEffect, useState } from 'react';

import { EmptyState, Skeleton } from '@/components/admin/AdminUi';
import { showAdminToast } from '@/components/admin/AdminShell';
import { bookingDb } from '@/lib/booking-db';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type Conv = { id: string; party_name: string; party_role: string; subject: string | null; last_message_at: string };
type Msg = { id: string; sender: string; body: string; created_at: string };

export function MessagesView() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = bookingDb(getSupabaseBrowser());
    supabase
      .from('ops_conversations')
      .select('id, party_name, party_role, subject, last_message_at')
      .order('last_message_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data as Conv[]) ?? [];
        setConvs(rows);
        setActive(rows[0]?.id ?? null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!active) return;
    const supabase = bookingDb(getSupabaseBrowser());
    async function loadMsgs() {
      const { data } = await supabase
        .from('ops_messages')
        .select('id, sender, body, created_at')
        .eq('conversation_id', active)
        .order('created_at');
      setMsgs((data as Msg[]) ?? []);
    }
    void loadMsgs();
    const ch = supabase
      .channel(`ops-msg-${active}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ops_messages' }, () => void loadMsgs())
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [active]);

  async function send() {
    if (!active || !text.trim()) return;
    const { error } = await bookingDb(getSupabaseBrowser()).from('ops_messages').insert({
      conversation_id: active,
      sender: 'admin',
      body: text.trim(),
    });
    if (error) {
      showAdminToast('Le message n’a pas pu être envoyé.');
      return;
    }
    setText('');
    showAdminToast('Message envoyé');
    const { data } = await bookingDb(getSupabaseBrowser())
      .from('ops_messages')
      .select('id, sender, body, created_at')
      .eq('conversation_id', active)
      .order('created_at');
    setMsgs((data as Msg[]) ?? []);
  }

  if (loading) return <Skeleton className="h-80" />;
  if (convs.length === 0) return <EmptyState>Aucune conversation.</EmptyState>;

  return (
    <div className="grid min-h-[28rem] overflow-hidden rounded-2xl bg-white shadow-card lg:grid-cols-[16rem_1fr]">
      <ul className="border-b lg:border-b-0 lg:border-r">
        {convs.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => setActive(c.id)}
              className={`w-full px-4 py-3 text-left ${active === c.id ? 'bg-taxi/20' : ''}`}
            >
              <p className="font-medium">{c.party_name}</p>
              <p className="text-xs text-muted">{c.subject}</p>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {msgs.map((m) => (
            <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender === 'admin' ? 'ml-auto bg-taxi text-navy' : 'bg-[#F4F5F7]'}`}>
              <p>{m.body}</p>
              <p className="mt-1 text-[10px] opacity-70">{new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t p-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-11 flex-1 rounded-xl border px-3"
            placeholder="Écrire un message"
          />
          <button type="button" className="rounded-xl bg-navy px-4 text-white" onClick={() => void send()}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
