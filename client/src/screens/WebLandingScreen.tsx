import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  ShieldAlert,
  ShieldCheck,
  Droplets,
  Droplet,
  MapPin,
  Zap,
  Users,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  Radio,
  Volume2,
  Waves,
  Layers,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  Globe,
} from 'lucide-react-native';
import { navigateTo, WebRoute } from '../navigation/WebRouter';
import { ACCRA_CATCHMENTS } from '../constants/catchments';

// Dribbble Modern Clean Dark Palette — STRICTLY SOLID COLORS, ZERO GRADIENTS
const Palette = {
  bgVoid: '#070A0F',          // Deepest matte obsidian
  bgNavbar: '#0B0F17',        // Solid navbar surface
  surfaceCard: '#0F1622',     // Primary card surface
  surfaceElevated: '#161F2E', // Secondary card surface
  surfaceHover: '#1D283A',    // Elevated active surface
  
  // High-contrast solid accents
  accentCyan: '#22D3EE',      // Modern electric cyan
  accentCyanMuted: '#0E7490', // Solid cyan secondary
  accentGreen: '#10B981',     // Solid verified emerald
  accentAmber: '#F59E0B',     // Solid caution amber
  accentRed: '#EF4444',       // Solid emergency crimson
  accentBlue: '#3B82F6',      // Solid hydrology cobalt
  
  // Solid typography
  textPrimary: '#FFFFFF',     // Clean pure white
  textSecondary: '#CBD5E1',   // Crisp slate secondary
  textMuted: '#64748B',       // Low-priority meta slate
  textDim: '#475569',         // Subtle captions
  
  // Clean structural lines
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderSolid: '#1E293B',
  borderHighlight: 'rgba(34, 211, 238, 0.3)',
};

export const WebLandingScreen: React.FC<{
  navigateTo: (r: WebRoute) => void;
  isAuthenticated: boolean;
  logout: () => void;
}> = ({ navigateTo, isAuthenticated, logout }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'normal'>('all');
  const [selectedCatchment, setSelectedCatchment] = useState(ACCRA_CATCHMENTS[0].id);

  const filteredCatchments = ACCRA_CATCHMENTS.filter((c) => {
    if (activeTab === 'critical') return c.current_threat_level === 'CRITICAL' || c.current_threat_level === 'AMBER';
    if (activeTab === 'normal') return c.current_threat_level === 'LOW';
    return true;
  });

  const activeCatchmentData = ACCRA_CATCHMENTS.find((c) => c.id === selectedCatchment) || ACCRA_CATCHMENTS[0];

  return (
    <ScrollView
      style={styles.pageContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. TOP NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navLeft}>
          <View style={styles.brandBadge}>
            <ShieldAlert size={20} color={Palette.accentCyan} />
            <Text style={styles.brandName}>SkyGround</Text>
            <View style={styles.versionTag}>
              <Text style={styles.versionText}>v2.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.navCenter}>
          <TouchableOpacity
            style={[styles.navItem, styles.navItemActive]}
            onPress={() => navigateTo('/')}
          >
            <Text style={styles.navItemTextActive}>Platform</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigateTo('/dashboard')}
          >
            <Text style={styles.navItemText}>Basin Radar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigateTo('/dashboard')}
          >
            <Text style={styles.navItemText}>DRII Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigateTo('/dashboard')}
          >
            <Text style={styles.navItemText}>NADMO Command</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.navRight}>
          {isAuthenticated ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
              <Text style={styles.secondaryButtonText}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.ghostButton}
                onPress={() => navigateTo('/login')}
              >
                <Text style={styles.ghostButtonText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigateTo('/signup')}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <ArrowRight size={14} color="#070A0F" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* 2. HERO SECTION */}
      <View style={styles.heroSection}>
        {/* Status Chip */}
        <View style={styles.radarStatusChip}>
          <View style={styles.pulsingDot} />
          <Text style={styles.radarStatusText}>
            GREATER ACCRA HYDROMETRIC GRID • LIVE MONITORING
          </Text>
        </View>

        {/* Hero Headline */}
        <Text style={styles.heroHeadline}>
          Hyperlocal Flood Defense &amp; Hydrological Intelligence
        </Text>

        {/* Hero Subheadline */}
        <Text style={styles.heroDescription}>
          Real-time soil saturation tracking, PostGIS spatial runoff modeling, and
          localized Khaya AI voice alerting across Odawna, Adabraka, Alajo, and Glefe.
        </Text>

        {/* Hero CTA Group */}
        <View style={styles.heroCtaGroup}>
          <TouchableOpacity
            style={styles.largePrimaryBtn}
            onPress={() => navigateTo('/dashboard')}
          >
            <Radio size={18} color="#070A0F" style={{ marginRight: 8 }} />
            <Text style={styles.largePrimaryBtnText}>Launch Live Command Center</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.largeSecondaryBtn}
            onPress={() => navigateTo('/signup')}
          >
            <Text style={styles.largeSecondaryBtnText}>Create Free Account</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Fast Metrics Strip */}
        <View style={styles.heroMetricsStrip}>
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>4</Text>
            <Text style={styles.metricLabel}>Monitored Basins</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>15s</Text>
            <Text style={styles.metricLabel}>Sensor Interval</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>3</Text>
            <Text style={styles.metricLabel}>Local Dialects (Twi/Ga/En)</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>&lt; 2.4s</Text>
            <Text style={styles.metricLabel}>Gemini AI Reasoning</Text>
          </View>
        </View>
      </View>

      {/* 3. DRIBBLE BENTO GRID SHOWCASE */}
      <View style={styles.bentoSection}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionPretitle}>ENGINEERING ARCHITECTURE</Text>
            <Text style={styles.sectionTitle}>Precision Technology on the Ground</Text>
          </View>
          <TouchableOpacity
            style={styles.sectionHeaderBtn}
            onPress={() => navigateTo('/dashboard')}
          >
            <Text style={styles.sectionHeaderBtnText}>Open Operational View</Text>
            <ArrowRight size={14} color={Palette.accentCyan} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.bentoGrid}>
          {/* Bento Card 1: Large DRII Engine Preview */}
          <View style={[styles.bentoCard, styles.bentoCardSpan2]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#1E293B' }]}>
                <Waves size={20} color={Palette.accentCyan} />
              </View>
              <View style={styles.cardHeaderMeta}>
                <Text style={styles.cardTitle}>Dynamic Runoff &amp; Inundation Index (DRII)</Text>
                <Text style={styles.cardSubtitle}>Continuous hydrological mathematical modeling</Text>
              </View>
            </View>

            <Text style={styles.cardBodyText}>
              DRII computes immediate flash flood vulnerability by combining real-time rainfall rate,
              24-hour antecedent precipitation, satellite soil moisture saturation, and basin elevation curves.
            </Text>

            <View style={styles.formulaRow}>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaTag}>RAINFALL ACCUMULATION</Text>
                <Text style={styles.formulaValue}>40% Weight</Text>
              </View>
              <Text style={styles.formulaPlus}>+</Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaTag}>SOIL WATERLOGGING</Text>
                <Text style={styles.formulaValue}>35% Weight</Text>
              </View>
              <Text style={styles.formulaPlus}>+</Text>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaTag}>OUTFALL RESISTANCE</Text>
                <Text style={styles.formulaValue}>25% Weight</Text>
              </View>
            </View>
          </View>

          {/* Bento Card 2: Voice Matrix in Twi & Ga */}
          <View style={styles.bentoCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#1E293B' }]}>
                <Volume2 size={20} color={Palette.accentGreen} />
              </View>
              <View style={styles.cardHeaderMeta}>
                <Text style={styles.cardTitle}>Khaya AI Voice Engine</Text>
                <Text style={styles.cardSubtitle}>Acoustic matrix in local dialects</Text>
              </View>
            </View>
            <Text style={styles.cardBodyText}>
              Broadcasts emergency evacuation instructions directly to residents in Twi, Ga, and English
              with offline audio caching when mobile network connectivity fails.
            </Text>
            <View style={styles.tagPillRow}>
              <View style={styles.solidPill}>
                <Text style={styles.solidPillText}>Asante Twi</Text>
              </View>
              <View style={styles.solidPill}>
                <Text style={styles.solidPillText}>Ga Language</Text>
              </View>
              <View style={styles.solidPill}>
                <Text style={styles.solidPillText}>English</Text>
              </View>
            </View>
          </View>

          {/* Bento Card 3: PostGIS Spatial Precision */}
          <View style={styles.bentoCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#1E293B' }]}>
                <Layers size={20} color={Palette.accentAmber} />
              </View>
              <View style={styles.cardHeaderMeta}>
                <Text style={styles.cardTitle}>Neon PostGIS Spatial Boundaries</Text>
                <Text style={styles.cardSubtitle}>Centimeter polygon ray-casting</Text>
              </View>
            </View>
            <Text style={styles.cardBodyText}>
              Every telemetry signal and user GPS coordinates are verified via serverless PostGIS
              spatial predicates (`ST_Contains`, `ST_DWithin`) against accurate drainage catchment polygons.
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.geoPill}>
                <MapPin size={12} color={Palette.accentCyan} style={{ marginRight: 4 }} />
                <Text style={styles.geoPillText}>EPSG:4326 PostGIS</Text>
              </View>
              <View style={styles.geoPill}>
                <ShieldCheck size={12} color={Palette.accentGreen} style={{ marginRight: 4 }} />
                <Text style={styles.geoPillText}>Sub-second Queries</Text>
              </View>
            </View>
          </View>

          {/* Bento Card 4: Community Ground-Truthing */}
          <View style={[styles.bentoCard, styles.bentoCardSpan2]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#1E293B' }]}>
                <Users size={20} color={Palette.accentBlue} />
              </View>
              <View style={styles.cardHeaderMeta}>
                <Text style={styles.cardTitle}>Crowdsourced Ground-Truthing &amp; Verification</Text>
                <Text style={styles.cardSubtitle}>1-tap incident logging for citizens and first responders</Text>
              </View>
            </View>
            <Text style={styles.cardBodyText}>
              Residents report choked gutters, high water levels, and impassable footbridges in real time.
              Reports are geo-clustered, verified by nearby residents, and surfaced directly to municipal teams.
            </Text>
            <View style={styles.incidentPreviewRow}>
              <View style={styles.incidentChip}>
                <AlertTriangle size={14} color={Palette.accentRed} style={{ marginRight: 6 }} />
                <Text style={styles.incidentChipText}>Odawna Market Gutter: Choked</Text>
              </View>
              <View style={styles.incidentChip}>
                <Droplet size={14} color={Palette.accentBlue} style={{ marginRight: 6 }} />
                <Text style={styles.incidentChipText}>Alajo Bridge: High Water</Text>
              </View>
              <View style={styles.incidentChip}>
                <CheckCircle2 size={14} color={Palette.accentGreen} style={{ marginRight: 6 }} />
                <Text style={styles.incidentChipText}>Glefe Lagoon Outfall: Flowing</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 4. MONITORED BASINS INTERACTIVE SECTION */}
      <View style={styles.basinsSection}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionPretitle}>GREATER ACCRA NETWORK</Text>
            <Text style={styles.sectionTitle}>Live Basin Telemetry</Text>
          </View>

          <View style={styles.tabFilterRow}>
            <TouchableOpacity
              style={[styles.filterChip, activeTab === 'all' && styles.filterChipActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.filterChipText, activeTab === 'all' && styles.filterChipTextActive]}>
                All (4)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeTab === 'critical' && styles.filterChipActive]}
              onPress={() => setActiveTab('critical')}
            >
              <Text style={[styles.filterChipText, activeTab === 'critical' && styles.filterChipTextActive]}>
                Alerts (3)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeTab === 'normal' && styles.filterChipActive]}
              onPress={() => setActiveTab('normal')}
            >
              <Text style={[styles.filterChipText, activeTab === 'normal' && styles.filterChipTextActive]}>
                Safe (1)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Catchment Basin Cards */}
        <View style={styles.basinsGrid}>
          {filteredCatchments.map((c) => {
            const isCritical = c.current_threat_level === 'CRITICAL';
            const isAmber = c.current_threat_level === 'AMBER';
            const threatColor = isCritical ? Palette.accentRed : isAmber ? Palette.accentAmber : Palette.accentGreen;
            const isSelected = c.id === selectedCatchment;

            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.basinCard,
                  isSelected && styles.basinCardSelected,
                ]}
                activeOpacity={0.85}
                onPress={() => setSelectedCatchment(c.id)}
              >
                <View style={styles.basinCardHeader}>
                  <View>
                    <Text style={styles.basinName}>{c.name}</Text>
                    <Text style={styles.basinDistrict}>{c.district} District</Text>
                  </View>
                  <View style={[styles.threatBadge, { backgroundColor: threatColor }]}>
                    <Text style={styles.threatBadgeText}>
                      {c.current_threat_level}
                    </Text>
                  </View>
                </View>

                <View style={styles.basinMetricList}>
                  <View style={styles.basinMetricRow}>
                    <Text style={styles.metricName}>Soil Saturation</Text>
                    <Text style={[styles.metricValue, { color: c.soil_saturation_pct >= 85 ? Palette.accentRed : Palette.textPrimary }]}>
                      {c.soil_saturation_pct}%
                    </Text>
                  </View>
                  <View style={styles.basinMetricRow}>
                    <Text style={styles.metricName}>24h Rain Accumulation</Text>
                    <Text style={styles.metricValue}>{c.accum_24h_mm} mm</Text>
                  </View>
                  <View style={styles.basinMetricRow}>
                    <Text style={styles.metricName}>Base Elevation</Text>
                    <Text style={styles.metricValue}>{c.base_elevation_m} m</Text>
                  </View>
                  <View style={styles.basinMetricRow}>
                    <Text style={styles.metricName}>Drainage Outfall</Text>
                    <Text style={styles.metricValueDim}>{c.drainage_outfall}</Text>
                  </View>
                </View>

                <View style={styles.basinCardFooter}>
                  <Text style={styles.viewBasinText}>Open in Radar Dashboard</Text>
                  <ArrowRight size={14} color={Palette.accentCyan} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 5. HOW IT WORKS / TIMELINE */}
      <View style={styles.workflowSection}>
        <View style={styles.workflowHeader}>
          <Text style={styles.sectionPretitle}>AUTOMATED PIPELINE</Text>
          <Text style={styles.sectionTitle}>From Sensor Telemetry to Local Alerts</Text>
        </View>

        <View style={styles.stepsGrid}>
          {[
            {
              num: '01',
              title: 'Telemetry Ingestion',
              desc: 'High-frequency soil moisture sensors and rainfall gauges feed live hydrological observations.',
            },
            {
              num: '02',
              title: 'PostGIS Spatial Query',
              desc: 'Boundary ray-casting associates GPS data with local drainage basins and historical crest points.',
            },
            {
              num: '03',
              title: 'Gemini 2.5 Flash Reasoning',
              desc: 'AI analysis synthesizes waterlog deficit, rainfall trend, and generates actionable advisories.',
            },
            {
              num: '04',
              title: 'Khaya Dialect Broadcast',
              desc: 'Acoustic voice synthesis delivers audio warnings in Twi, Ga, and English before cresting.',
            },
          ].map((s) => (
            <View key={s.num} style={styles.stepCard}>
              <Text style={styles.stepNum}>{s.num}</Text>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 6. MUNICIPAL DISASTER RESPONSE BANNER */}
      <View style={styles.municipalBanner}>
        <View style={styles.municipalLeft}>
          <Building2 size={32} color={Palette.accentCyan} style={{ marginBottom: 12 }} />
          <Text style={styles.municipalTitle}>Built for Municipal Engineers &amp; NADMO Officers</Text>
          <Text style={styles.municipalDesc}>
            Prioritize desilting operations, allocate water pumping units, and track verified citizen hazards
            on a unified command map tailored for Greater Accra municipal assemblies.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.municipalBtn}
          onPress={() => navigateTo('/signup')}
        >
          <Text style={styles.municipalBtnText}>Request Municipal Access</Text>
          <ArrowRight size={16} color="#070A0F" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {/* 7. CLEAN MODERN FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerTop}>
          <View style={styles.footerBrand}>
            <View style={styles.brandBadge}>
              <ShieldAlert size={18} color={Palette.accentCyan} />
              <Text style={styles.brandName}>SkyGround</Text>
            </View>
            <Text style={styles.footerTagline}>
              Hyperlocal Flood Defense &amp; Hydrological Intelligence for Greater Accra.
            </Text>
          </View>

          <View style={styles.footerLinksGroup}>
            <Text style={styles.footerColTitle}>Navigation</Text>
            <TouchableOpacity onPress={() => navigateTo('/')}>
              <Text style={styles.footerLink}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateTo('/dashboard')}>
              <Text style={styles.footerLink}>Basin Radar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateTo('/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateTo('/signup')}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerLinksGroup}>
            <Text style={styles.footerColTitle}>Monitored Basins</Text>
            <Text style={styles.footerLinkDim}>Odawna Circle</Text>
            <Text style={styles.footerLinkDim}>Adabraka Basin</Text>
            <Text style={styles.footerLinkDim}>Alajo Confluence</Text>
            <Text style={styles.footerLinkDim}>Glefe Lagoon</Text>
          </View>

          <View style={styles.footerLinksGroup}>
            <Text style={styles.footerColTitle}>System Status</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDotGreen} />
              <Text style={styles.statusText}>All 4 Catchment Gateways Online</Text>
            </View>
            <Text style={styles.footerLinkDim}>PostGIS Spatial: Connected</Text>
            <Text style={styles.footerLinkDim}>Khaya AI Voice: Active</Text>
          </View>
        </View>

        <View style={styles.footerBottom}>
          <Text style={styles.copyrightText}>
            &copy; {new Date().getFullYear()} SkyGround. All rights reserved. Accra, Ghana.
          </Text>
          <View style={styles.footerBottomLinks}>
            <Text style={styles.footerSmallLink}>Privacy Policy</Text>
            <Text style={styles.footerDot}>•</Text>
            <Text style={styles.footerSmallLink}>Terms of Service</Text>
            <Text style={styles.footerDot}>•</Text>
            <Text style={styles.footerSmallLink}>NADMO Guidelines</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// DRIBBBLE STYLESHEET — CLEAN, FLAT, HIGH-CONTRAST DARK MODE
const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: Palette.bgVoid,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // Navbar
  navbar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 48 : 20,
    paddingVertical: 18,
    backgroundColor: Palette.bgNavbar,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.textPrimary,
    letterSpacing: -0.5,
  },
  versionTag: {
    backgroundColor: Palette.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.accentCyan,
  },
  navCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    ...(Platform.OS !== 'web' && { display: 'none' }),
  },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: Palette.accentCyan,
  },
  navItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  navItemTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ghostButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ghostButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.accentCyan,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#070A0F',
  },
  secondaryButton: {
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
  },

  // Hero
  heroSection: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 72 : 40,
    paddingBottom: 64,
    alignItems: 'center',
    textAlign: 'center',
  },
  radarStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
    gap: 8,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.accentGreen,
  },
  radarStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textSecondary,
    letterSpacing: 0.8,
  },
  heroHeadline: {
    fontSize: Platform.OS === 'web' ? 52 : 34,
    fontWeight: '900',
    color: Palette.textPrimary,
    lineHeight: Platform.OS === 'web' ? 62 : 42,
    textAlign: 'center',
    letterSpacing: -1.2,
    marginBottom: 20,
    maxWidth: 900,
  },
  heroDescription: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: Palette.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
    maxWidth: 720,
    marginBottom: 36,
  },
  heroCtaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 48,
  },
  largePrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.accentCyan,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 10,
  },
  largePrimaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#070A0F',
    letterSpacing: -0.2,
  },
  largeSecondaryBtn: {
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1,
    borderColor: Palette.borderSolid,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  largeSecondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  heroMetricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 28,
    width: '100%',
    maxWidth: 880,
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.accentCyan,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textMuted,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: Palette.borderSubtle,
    ...(Platform.OS !== 'web' && { display: 'none' }),
  },

  // Bento Grid Section
  bentoSection: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 16,
  },
  sectionPretitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.accentCyan,
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Palette.textPrimary,
    letterSpacing: -0.8,
  },
  sectionHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sectionHeaderBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.accentCyan,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  bentoCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 340 : '100%',
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: 16,
    padding: 24,
  },
  bentoCardSpan2: {
    minWidth: Platform.OS === 'web' ? 560 : '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderMeta: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  cardBodyText: {
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 22,
    marginBottom: 18,
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  formulaBox: {
    flex: 1,
    minWidth: 120,
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1,
    borderColor: Palette.borderSolid,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  formulaTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.textMuted,
    letterSpacing: 0.5,
  },
  formulaValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.accentCyan,
    marginTop: 2,
  },
  formulaPlus: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.textMuted,
  },
  tagPillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  solidPill: {
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1,
    borderColor: Palette.borderSolid,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  solidPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.accentGreen,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  geoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1,
    borderColor: Palette.borderSolid,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  geoPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textSecondary,
  },
  incidentPreviewRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  incidentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1,
    borderColor: Palette.borderSolid,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  incidentChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },

  // Basins Section
  basinsSection: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  tabFilterRow: {
    flexDirection: 'row',
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  filterChipActive: {
    backgroundColor: Palette.surfaceElevated,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textMuted,
  },
  filterChipTextActive: {
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  basinsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  basinCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 260 : '100%',
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: 14,
    padding: 20,
  },
  basinCardSelected: {
    borderColor: Palette.borderHighlight,
    backgroundColor: Palette.surfaceElevated,
  },
  basinCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  basinName: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  basinDistrict: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  threatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  threatBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#070A0F',
    letterSpacing: 0.5,
  },
  basinMetricList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingVertical: 12,
    marginBottom: 14,
    gap: 8,
  },
  basinMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricName: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  metricValueDim: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  basinCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewBasinText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.accentCyan,
  },

  // Workflow Steps
  workflowSection: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  workflowHeader: {
    marginBottom: 28,
  },
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  stepCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 240 : '100%',
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: 14,
    padding: 22,
  },
  stepNum: {
    fontSize: 28,
    fontWeight: '900',
    color: Palette.accentCyan,
    marginBottom: 10,
    letterSpacing: -1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 20,
  },

  // Municipal Banner
  municipalBanner: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    marginHorizontal: 24,
    marginVertical: 48,
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1,
    borderColor: Palette.borderSolid,
    borderRadius: 16,
    padding: Platform.OS === 'web' ? 40 : 24,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    justifyContent: 'space-between',
    gap: 24,
  },
  municipalLeft: {
    flex: 1,
  },
  municipalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  municipalDesc: {
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 22,
    maxWidth: 680,
  },
  municipalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.accentCyan,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 10,
  },
  municipalBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#070A0F',
  },

  // Footer
  footer: {
    width: '100%',
    backgroundColor: Palette.bgNavbar,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    paddingHorizontal: Platform.OS === 'web' ? 64 : 24,
    paddingTop: 56,
    paddingBottom: 36,
  },
  footerTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 36,
    marginBottom: 44,
  },
  footerBrand: {
    maxWidth: 320,
  },
  footerTagline: {
    fontSize: 13,
    color: Palette.textMuted,
    lineHeight: 20,
    marginTop: 12,
  },
  footerLinksGroup: {
    gap: 10,
  },
  footerColTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 13,
    color: Palette.textSecondary,
  },
  footerLinkDim: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.accentGreen,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.accentGreen,
  },
  footerBottom: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    paddingTop: 24,
    gap: 14,
  },
  copyrightText: {
    fontSize: 12,
    color: Palette.textDim,
  },
  footerBottomLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerSmallLink: {
    fontSize: 12,
    color: Palette.textDim,
  },
  footerDot: {
    fontSize: 10,
    color: Palette.textDim,
  },
});
