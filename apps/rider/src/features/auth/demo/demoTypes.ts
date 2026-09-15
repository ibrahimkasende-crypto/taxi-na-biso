/**
 * TEMPORAIRE — type de session locale. Ce n’est pas une Session Supabase.
 */

export type DemoSession = {
  mode: 'demo-local';
  user: {
    id: string;
    phone: string;
    role: 'rider';
    displayName: string;
  };
  createdAt: string;
  /** Photo locale optionnelle : ikas (défaut) ou avatar de secours bundlé. */
  avatarKey?: 'ikas' | 'default';
};
