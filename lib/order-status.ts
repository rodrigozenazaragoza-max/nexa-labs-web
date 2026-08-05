export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente de pago', className: 'bg-warn-bg text-warn' },
  paid: { label: 'Pagado — en preparación', className: 'bg-primary-light text-primary-dark' },
  shipped: { label: 'Enviado', className: 'bg-primary text-white' },
  cancelled: { label: 'Cancelado', className: 'bg-danger-bg text-danger' },
};
