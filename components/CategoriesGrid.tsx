import { siteConfig } from '@/lib/site-config';
import { iconMap } from './icons';

export default function CategoriesGrid() {
  return (
    // Fondo blanco: antes compartía el verde menta de la sección anterior y
    // los iconos —también en verde claro— se perdían contra él.
    <section className="bg-white py-14">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="mx-auto max-w-md text-sm text-muted">
          Explora nuestras categorías y encuentra el péptido ideal para tu investigación.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {siteConfig.categories.map((cat) => {
            const Icon = iconMap[cat.icon];
            return (
              <div key={cat.name} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
                  {Icon && <Icon size={26} />}
                </div>
                <p className="text-xs font-semibold text-ink">{cat.name}</p>
                <p className="mt-1 text-xs text-muted">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
