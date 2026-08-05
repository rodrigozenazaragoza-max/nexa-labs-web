import { siteConfig } from '@/lib/site-config';
import AddressBook from '@/components/account/AddressBook';

export const metadata = { title: `Mis direcciones | ${siteConfig.brand.name}` };

export default function DireccionesPage() {
  return <AddressBook />;
}
