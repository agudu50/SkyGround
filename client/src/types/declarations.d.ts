declare module 'lucide-react-native' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';

  export interface IconProps extends SvgProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }

  export type Icon = React.FC<IconProps>;

  export const MapPin: Icon;
  export const Wifi: Icon;
  export const ShieldAlert: Icon;
  export const ShieldCheck: Icon;
  export const ChevronDown: Icon;
  export const ChevronUp: Icon;
  export const Check: Icon;
  export const Building2: Icon;
  export const User: Icon;
  export const CloudRain: Icon;
  export const Sun: Icon;
  export const CloudLightning: Icon;
  export const Wind: Icon;
  export const Droplets: Icon;
  export const Droplet: Icon;
  export const AlertTriangle: Icon;
  export const AlertCircle: Icon;
  export const Play: Icon;
  export const Pause: Icon;
  export const Volume2: Icon;
  export const Globe: Icon;
  export const Sparkles: Icon;
  export const Navigation: Icon;
  export const Navigation2: Icon;
  export const Waves: Icon;
  export const Construction: Icon;
  export const TriangleAlert: Icon;
  export const CheckCircle: Icon;
  export const CheckCircle2: Icon;
  export const Flame: Icon;
  export const Layers: Icon;
  export const FileText: Icon;
  export const Wrench: Icon;
  export const Truck: Icon;
  export const Share2: Icon;
  export const LogIn: Icon;
  export const LogOut: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const UserPlus: Icon;
  export const Radio: Icon;
}

