import { BrandLogo, SiteHeader } from '@/components/SiteChrome';
import { AuthAtmosphere } from '@/components/AuthAtmosphere';

export function AuthSplit({
  title,
  subtitle,
  variant = 'rider',
  children,
}: {
  title: string;
  subtitle: string;
  variant?: 'rider' | 'driver';
  children: React.ReactNode;
}) {
  const driver = variant === 'driver';

  return (
    <>
      <SiteHeader />
      <div className={`relative min-h-screen overflow-x-clip ${driver ? 'bg-[#161b27] text-white' : 'bg-canvas'}`}>
        <AuthAtmosphere variant={variant} />
        <div className="tnb-shell relative z-10 grid min-h-screen items-center gap-10 pb-16 pt-28 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)] lg:gap-16">
          <div className={`${driver ? 'text-white' : 'text-ink'}`}>
            <BrandLogo inverted={driver} className="h-11 w-auto max-w-[240px] object-contain object-left" />
            <p className={`mt-6 text-xs font-semibold uppercase tracking-[0.22em] ${driver ? 'text-white/45' : 'text-brand'}`}>
              Taxi Na Biso
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            <p className={`mt-3 max-w-md text-sm leading-relaxed ${driver ? 'text-white/70' : 'text-muted'}`}>{subtitle}</p>
            <div className="tnb-route mt-10 hidden items-center gap-3 text-[11px] font-medium uppercase tracking-[0.16em] lg:flex">
              <span className={driver ? 'text-white/35' : 'text-ink/30'}>Départ</span>
              <span className="h-2 w-2 rounded-full bg-brand/55" />
              <span className={`h-px flex-1 ${driver ? 'bg-white/20' : 'bg-ink/15'}`} />
              <span className={`h-2 w-2 rounded-full ${driver ? 'bg-white/35' : 'bg-ink/25'}`} />
              <span className={driver ? 'text-white/35' : 'text-ink/30'}>Chauffeur</span>
              <span className={`h-px flex-1 ${driver ? 'bg-white/20' : 'bg-ink/15'}`} />
              <span className="h-2 w-2 rounded-full bg-brand/55" />
              <span className={driver ? 'text-white/35' : 'text-ink/30'}>Destination</span>
            </div>
          </div>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </>
  );
}
