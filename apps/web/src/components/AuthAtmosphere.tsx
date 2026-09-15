import { Armchair, Car, Flag, MapPin, Navigation, ShieldCheck, Smartphone, Star, UserRound } from 'lucide-react';

export function AuthAtmosphere({ variant }: { variant: 'rider' | 'driver' }) {
  const ink = variant === 'driver' ? 'text-white' : 'text-ink';
  const brand = 'text-brand';

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="tnb-halo absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="tnb-halo-slow absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-ink/10 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(240,74,24,0.08),transparent_34%),radial-gradient(circle_at_82%_78%,rgba(17,24,39,0.06),transparent_36%)]" />

      <Car className={`tnb-drift absolute left-[7%] top-[20%] hidden h-12 w-12 opacity-[0.12] lg:block ${ink}`} />
      <MapPin className={`tnb-marker-soft absolute left-[16%] top-[56%] hidden h-8 w-8 opacity-30 lg:block ${brand}`} />
      <ShieldCheck className={`absolute right-[11%] top-[26%] hidden h-10 w-10 opacity-[0.13] blur-[0.4px] lg:block ${ink}`} />
      <UserRound className={`tnb-float absolute right-[20%] bottom-[20%] hidden h-9 w-9 opacity-[0.11] lg:block ${ink}`} />
      <Star className={`absolute left-[27%] top-[16%] hidden h-6 w-6 opacity-20 lg:block ${brand}`} />
      <Smartphone className={`tnb-float-slow absolute left-[6%] bottom-[16%] hidden h-8 w-8 opacity-[0.1] lg:block ${ink}`} />
      <Navigation className={`absolute right-[8%] bottom-[34%] hidden h-8 w-8 rotate-45 opacity-[0.14] lg:block ${brand}`} />
      <Armchair className={`tnb-float-slow absolute right-[28%] top-[18%] hidden h-7 w-7 opacity-[0.1] lg:block ${ink}`} />
      <Flag className={`absolute left-[38%] bottom-[18%] hidden h-7 w-7 opacity-[0.12] lg:block ${brand}`} />

      <Car className={`tnb-drift absolute right-[9%] top-[14%] h-8 w-8 opacity-[0.14] lg:hidden ${ink}`} />
      <MapPin className={`tnb-marker-soft absolute left-[10%] bottom-[12%] h-7 w-7 opacity-25 lg:hidden ${brand}`} />
    </div>
  );
}
