'use client';

import { useState } from 'react';

// Selector de categoría: muestra las categorías que ya existen en el
// catálogo (para no repetir "Metabolismo" y "metabolismo" por accidente),
// con una opción al final para escribir una categoría nueva si hace falta.
export default function CategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  // Si el valor actual no está en la lista conocida (ej. viene de un
  // producto ya guardado con una categoría que ya no se usa en ningún
  // otro), lo tratamos como "nueva" para no perderlo silenciosamente.
  const knownCategories = categories.includes(value) || !value ? categories : [...categories, value];
  const [isNew, setIsNew] = useState(value ? !categories.includes(value) : false);

  if (isNew) {
    return (
      <div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-theme border border-border px-3 py-2 text-sm"
          placeholder="Nombre de la nueva categoría"
          autoFocus
        />
        {knownCategories.length > 0 && (
          <button
            type="button"
            onClick={() => setIsNew(false)}
            className="mt-1 text-[11px] font-semibold text-primary hover:underline"
          >
            ← Elegir de las que ya existen
          </button>
        )}
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => {
        if (e.target.value === '__nueva__') {
          setIsNew(true);
          onChange('');
        } else {
          onChange(e.target.value);
        }
      }}
      className="w-full rounded-theme border border-border px-3 py-2 text-sm"
    >
      <option value="" disabled>
        Elige una categoría...
      </option>
      {knownCategories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      <option value="__nueva__">+ Agregar categoría nueva</option>
    </select>
  );
}
