export const Colors = {
  // Base Surfaces
  bgDark: '#0B0F17',          // Deep Midnight Slate
  cardSurface: '#151D2A',     // Card Surface
  cardElevated: '#1D2738',    // Higher contrast surface
  cardHighlight: '#222E42',   // Active / pressed cards
  
  // Contrast Accents
  electricCyan: '#06B6D4',    // Daily primary & live sensors
  amberWarning: '#F59E0B',    // Amber alert
  crimsonEmergency: '#EF4444',// Red critical alert
  waterlogBlue: '#3B82F6',    // Persistent saturated soil / waterlog
  emeraldSuccess: '#10B981',  // Safe / verified
  
  // Threat Level Semantics
  threat: {
    LOW: {
      primary: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.35)',
      glow: '#10B981',
      badge: '#047857',
      label: 'NORMAL / SAFE',
    },
    AMBER: {
      primary: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.14)',
      border: 'rgba(245, 158, 11, 0.45)',
      glow: '#F59E0B',
      badge: '#B45309',
      label: 'AMBER FLOOD WATCH',
    },
    CRITICAL: {
      primary: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.18)',
      border: 'rgba(239, 68, 68, 0.65)',
      glow: '#EF4444',
      badge: '#B91C1C',
      label: 'CRITICAL INUNDATION',
    },
  },

  // Borders & Dividers
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(6, 182, 212, 0.4)',
  divider: 'rgba(255, 255, 255, 0.06)',

  // Typography
  textPrimary: '#F8FAFC',     // Crisp white
  textSecondary: '#94A3B8',   // Slate muted
  textMuted: '#64748B',       // Low-priority caption
  textAccent: '#38BDF8',      // Cyan glow text

  // Hazard Icon Colors
  hazards: {
    HIGH_WATER: '#EF4444',
    CHOKED_GUTTER: '#F59E0B',
    IMPASSABLE_BRIDGE: '#EC4899',
    STANDING_WATER: '#3B82F6',
  },
};

export const UI = {
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    pill: 9999,
  },
  minTouchTarget: 56,
};

