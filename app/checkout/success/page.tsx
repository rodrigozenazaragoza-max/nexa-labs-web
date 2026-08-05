export default function SuccessPage({ searchParams }: { searchParams: { order?: string; mock?: string } }) {
  return (
    <div className="mx-auto max-w-lg px-6 py-14 text-center">
      <h1 className="mb-4 text-2xl font-bold text-ink">¡Pedido recibido!</h1>
      <p className="mb-2 text-muted">Tu número de pedido es:</p>
      <p className="mb-6 rounded-theme border-2 border-primary/30 bg-primary/5 px-4 py-3 text-lg font-bold tracking-wide text-primary">
        {searchParams.order}
      </p>
      <p className="mb-6 text-sm text-muted">
        Guarda este número — lo necesitarás para{' '}
        <a href="/rastrea-pedido" className="font-semibold text-primary">rastrear tu pedido</a>{' '}
        o{' '}
        <a href="/devoluciones" className="font-semibold text-primary">solicitar una devolución</a>.
      </p>
      {searchParams.mock && (
        <p className="rounded-lg border border-warn/40 bg-warn/10 p-4 text-sm text-warn">
          Modo mock: no se procesó ningún pago real porque MONELO_SECRET_KEY no
          está configurada todavía. Configúrala en .env.local cuando tengas tu
          cuenta aprobada.
        </p>
      )}
    </div>
  );
}
