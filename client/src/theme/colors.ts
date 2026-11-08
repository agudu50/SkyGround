export const Colors = {
  // Base Surfaces — Deep Midnight Slate modernized
  bgDark: '#05070A',            // Deepest void background
  bgSecondary: '#0B0F17',       // Slightly lighter sections
  cardSurface: '#0F172A',       // Slate-900 card surface
  cardElevated: '#1E293B',      // Slate-800 elevated surface
  cardHighlight: '#334155',     // Active / pressed cards
  
  // Gradients (used in linear-gradient backgrounds)
  gradientPrimary: ['#0F172A', '#1E293B'],
  gradientGlow: ['rgba(34, 211, 238, 0.15)', 'rgba(34, 211, 238, 0.05)'],
  gradientThreat: {
    LOW: ['rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.04)'],
    AMBER: ['rgba(251, 191, 36, 0.14)', 'rgba(251, 191, 36, 0.04)'],
    CRITICAL: ['rgba(248, 113, 113, 0.18)', 'rgba(248, 113, 113, 0.06)'],
  },
  
  // Contrast Accents — Vibrant modern accents
  electricCyan: '#22D3EE',     // Daily primary & live sensors (brighter)
  electricCyanGlow: 'rgba(34, 211, 238, 0.5)',
  amberWarning: '#FBBF24',     // Amber alert (brighter)
  amberWarningGlow: 'rgba(251, 191, 36, 0.5)',
  crimsonEmergency: '#F87171', // Red critical alert (brighter)
  crimsonEmergencyGlow: 'rgba(248, 113, 113, 0.5)',
  waterlogBlue: '#60A5FA',     // Persistent saturated soil / waterlog
  waterlogBlueGlow: 'rgba(96, 165, 250, 0.5)',
  emeraldSuccess: '#34D399',   // Safe / verified
  
  // Threat Level Semantics
  threat: {
    LOW: {
      primary: '#34D399',
      bg: 'rgba(52, 211, 153, 0.12)',
      border: 'rgba(52, 211, 153, 0.35)',
      glow: '#34D399',
      badge: '#065F46',
      label: 'NORMAL / SAFE',
    },
    AMBER: {
      primary: '#FBBF24',
      bg: 'rgba(251, 191, 36, 0.14)',
      border: 'rgba(251, 191, 36, 0.45)',
      glow: '#FBBF24',
      badge: '#B45309',
      label: 'AMBER FLOOD WATCH',
    },
    CRITICAL: {
      primary: '#F87171',
      bg: 'rgba(248, 113, 113, 0.18)',
      border: 'rgba(248, 113, 113, 0.65)',
      glow: '#F87171',
      badge: '#B91C1C',
      label: 'CRITICAL INUNDATION',
    },
  },
  
  // Borders & Dividers — Subtle glass borders
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(34, 211, 238, 0.4)',
  divider: 'rgba(255, 255, 255, 0.06)',
  
  // Typography
  textPrimary: '#F8FAFC',      // Crisp white
  textSecondary: '#CBD5E1',    // Slate muted (lighter for readability)
  textMuted: '#94A3B8',        // Low-priority caption
  textAccent: '#7DD3FC',       // Cyan glow text
  
  // Hazard Icon Colors
  hazards: {
    HIGH_WATER: '#F87171',
    CHOKED_GUTTER: '#FBBF24',
    IMPASSABLE_BRIDGE: '#F472B6',
    STANDING_WATER: '#60A5FA',
  },
};

export const UI = {
  borderRadius: {
    sm: 14,
    md: 20,
    lg: 28,
    xl: 36,
    pill: 9999,
  },
  minTouchTarget: 64,
  // Modern shadow / elevation system
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
      elevation: 12,
    },
  },
};
