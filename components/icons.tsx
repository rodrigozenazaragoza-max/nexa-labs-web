// Mapa central de íconos (lucide-react) usado por TrustBar y CategoriesGrid,
// para poder referenciar íconos por nombre string desde site-config.ts.
import {
  Truck, Headset, FileText, ShieldCheck, Scale, Infinity as InfinityIcon,
  Brain, Activity, Workflow, User, FlaskConical, Eye, MapPin, Thermometer,
  Lock, LucideIcon,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  truck: Truck,
  headset: Headset,
  file: FileText,
  shield: ShieldCheck,
  scale: Scale,
  infinity: InfinityIcon,
  brain: Brain,
  activity: Activity,
  workflow: Workflow,
  user: User,
  flask: FlaskConical,
  eye: Eye,
  pin: MapPin,
  thermometer: Thermometer,
  lock: Lock,
};
