'use client';

import { Download } from 'lucide-react';

// Exporta las filas a un .csv que abre directo en Excel — útil para
// imprimir/llenar a mano durante el conteo físico de inventario.
export default function ExportCsvButton({
  rows,
  filename,
}: {
  rows: Record<string, string | number>[];
  filename: string;
}) {
  function download() {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      disabled={rows.length === 0}
      className="flex items-center gap-1.5 rounded-theme border border-border px-3 py-2 text-xs font-semibold text-ink hover:border-primary disabled:opacity-50"
    >
      <Download size={13} /> Descargar CSV
    </button>
  );
}
