'use client';

import { getSupabaseBrowser } from '@/lib/supabase-browser';

export function SignOutButton({ href }: { href: string }) {
  return (
    <button
      type="button"
      className="whitespace-nowrap text-sm text-danger"
      onClick={async () => {
        await getSupabaseBrowser().auth.signOut();
        window.location.href = href;
      }}
    >
      Déconnexion
    </button>
  );
}
