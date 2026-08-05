import { siteConfig } from '@/lib/site-config';
import { iconMap } from './icons';

// Animación por ícono — misma idea que nexalabs.mx: cada ícono se mueve
// distinto (camión maneja, audífono "suena", hoja se agita, escudo late).
const animByIcon: Record<string, string> = {
  truck: 'anim-truck-drive',
  headset: 'anim-headset-call',
  file: 'anim-coa-wiggle',
  shield: 'anim-shield-pulse',
};

export default function TrustBar() {
  return (
    <section className="mx-auto max-w-6xl px-6 md:-mt-8">
      <div
        className="grid grid-cols-1 gap-6 rounded-[16px] px-8 py-8 text-white shadow-lg sm:grid-cols-2 lg:grid-cols-4"
        style={{ backgroundImage: 'linear-gradient(135deg, #04B99C 0%, #038D77 100%)' }}
      >
        {siteConfig.trustBar.map((item) => {
          const Icon = iconMap[item.icon];
          const animClass = animByIcon[item.icon] ?? '';
          return (
            <div key={item.title} className="flex flex-col items-center text-center">
              {Icon && <Icon size={26} className={`mb-2 ${animClass}`} />}
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-white/80">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
