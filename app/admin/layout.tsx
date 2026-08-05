import AdminTopBar from '@/components/admin/AdminTopBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <AdminTopBar />
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
