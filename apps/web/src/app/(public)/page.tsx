import { HeroVideo } from '@/components/HeroVideo';
import { HomeSections } from '@/components/HomeSections';

export default function HomePage() {
  return (
    <div className="overflow-x-clip">
      <HeroVideo />
      <HomeSections />
    </div>
  );
}
