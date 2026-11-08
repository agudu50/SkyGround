import React from 'react';
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
  Droplet,
  MapPin,
  Zap,
  Users,
  BarChart3,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react-native';
import { navigateTo, WebRoute } from '../navigation/WebRouter';

export const WebLandingScreen: React.FC<{
  navigateTo: (r: WebRoute) => void;
  isAuthenticated: boolean;
  logout: () => void;
}> = ({ navigateTo, isAuthenticated, logout }) => {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brand}>SkyGround</Text>
        </View>

        <View style={styles.navLinks}>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => navigateTo('/')}
          >
            <Text style={styles.navLinkText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => navigateTo('/dashboard')}
          >
            <Text style={styles.navLinkText}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navLink, styles.navLinkActive]}
            onPress={() => navigateTo('/login')}
          >
            <Text style={styles.navLinkTextActive}>Sign in</Text>
          </TouchableOpacity>
        </View>

        {isAuthenticated ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={logout}
          >
            <Text style={styles.navButtonText}>Sign out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={() => navigateTo('/signup')}
          >
            <Text style={styles.navButtonTextPrimary}>Get started</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Zap size={16} color={Colors.electricCyan} />
            <Text style={styles.heroBadgeText}>Live now &mdash; Greater Accra, Ghana</Text>
          </View>
          <Text style={styles.heroTitle}>
            Flood intelligence,{' '}
            <Text style={styles.heroTitleAccent}>on the ground.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            SkyGround is the early-warning and ground-truthing platform for
            flood-vulnerable urban communities. Real-time DRII risk, crowdsourced
            hazard reports, multilingual voice alerts, and municipal command &mdash;
            all in one modern dashboard.
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity
              style={[styles.heroButton, styles.heroButtonPrimary]}
              onPress={() => navigateTo('/signup')}
            >
              <Text style={styles.heroButtonText}>Start monitoring</Text>
              <ArrowRight size={18} color="#05070A" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroButtonSecondary}
              onPress={() => navigateTo('/login')}
            >
              <Text style={styles.heroButtonTextSecondary}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.heroVisual}>
          <View style={styles.heroGrid}>
            {[
              { label: 'Odawna', threat: 'AMBER' as const, sat: 78 },
              { label: 'Adabraka', threat: 'LOW' as const, sat: 52 },
              { label: 'Alajo', threat: 'CRITICAL' as const, sat: 91 },
              { label: 'Glefe', threat: 'AMBER' as const, sat: 84 },
            ].map((c) => (
              <View key={c.label} style={styles.catchmentPill}>
                <View
                  style={[
                    styles.pillDot,
                    {
                      backgroundColor:
                        c.threat === 'CRITICAL'
                          ? Colors.crimsonEmergency
                          : c.threat === 'AMBER'
                          ? Colors.amberWarning
                          : Colors.emeraldSuccess,
                    },
                  ]}
                />
                <Text style={styles.pillLabel}>{c.label}</Text>
                <Text style={styles.pillThreat}>{c.threat}</Text>
                <Text style={styles.pillSat}>{c.sat}% soil</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Built for the ground</Text>
          <Text style={styles.sectionSubtitle}>
            Everything you need to monitor, report, and act on flood risk.
          </Text>
        </View>

        <View style={styles.featuresGrid}>
          {[
            {
              icon: <ShieldAlert size={28} color={Colors.electricCyan} />,
              title: 'Live DRII Risk',
              desc: 'Dynamic Runoff &amp; Inundation Index with soil saturation gauges and threat levels.',
            },
            {
              icon: <Droplet size={28} color={Colors.waterlogBlue} />,
              title: 'Waterlog Detection',
              desc: 'Persistent soil moisture tracking flags zones with zero infiltration capacity post-storm.',
            },
            {
              icon: <MapPin size={28} color={Colors.amberWarning} />,
              title: '1-Tap Hazard Logger',
              desc: 'Geo-tagged community reports for high water, choked gutters, and impassable bridges.',
            },
            {
              icon: <Users size={28} color={Colors.crimsonEmergency} />,
              title: 'Multilingual Voice Alerts',
              desc: 'Khaya AI-powered advisories in Twi, Ga, and English with pulsing audio waveform.',
            },
            {
              icon: <BarChart3 size={28} color={Colors.textSecondary} />,
              title: 'Municipal Dashboard',
              desc: 'NADO &amp; district engineer command briefs with desilting priorities and action plans.',
            },
            {
              icon: <AlertTriangle size={28} color={Colors.crimsonEmergency} />,
              title: 'Spatial Hazard Map',
              desc: 'PostGIS catchment polygons, waterlog hatch layers, and verified incident pins.',
            },
          ].map((f, i) => (
            <TouchableOpacity
              key={i}
              style={styles.featureCard}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                {f.icon}
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Join the early-warning network.</Text>
        <Text style={styles.ctaSubtitle}>
          Sign up for free access to live catchment data, hazard reporting, and
          the municipal command dashboard.
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigateTo('/signup')}
        >
          <Text style={styles.ctaButtonText}>Create your account</Text>
          <ArrowRight size={18} color="#05070A" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerBrand}>
          <View style={styles.brandDot} />
          <Text style={styles.brand}>SkyGround</Text>
        </View>
        <Text style={styles.footerText}>
          Dynamic Weather Intelligence &amp; Localized Flood Defense for Greater Accra.
        </Text>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => navigateTo('/login')}
          >
            <Text style={styles.footerLinkText}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerLink}
            onPress={() => navigateTo('/signup')}
          >
            <Text style={styles.footerLinkText}>Sign up</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>|</Text>
          <Text style={styles.footerLinkText}>Privacy</Text>
          <Text style={styles.footerLinkText}>Terms</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const Colors = {
  bgDark: '#05070A',
  cardSurface: '#0F172A',
  cardElevated: '#1E293B',
  electricCyan: '#22D3EE',
  amberWarning: '#FBBF24',
  crimsonEmergency: '#F87171',
  waterlogBlue: '#60A5FA',
  emeraldSuccess: '#34D399',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.06)',
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  content: {
    paddingHorizontal: Platform.OS === 'web' ? 80 : 20,
    paddingVertical: 30,
    alignItems: 'center',
    minHeight: '100%',
  },
  navbar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 80 : 16,
    paddingVertical: Platform.OS === 'web' ? 24 : 16,
    position: 'absolute',
    top: 0,
    zIndex: 50,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.electricCyan,
  },
  brand: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  navLink: {
    paddingVertical: 6,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  navLinkActive: {},
  navLinkTextActive: {
    color: Colors.electricCyan,
    fontWeight: '700',
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  navButtonPrimary: {
    backgroundColor: Colors.electricCyan,
    borderColor: Colors.electricCyan,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  navButtonTextPrimary: {
    color: Colors.bgDark,
    fontWeight: '800',
  },
  hero: {
    width: '100%',
    paddingTop: Platform.OS === 'web' ? 140 : 60,
    paddingHorizontal: Platform.OS === 'web' ? 80 : 20,
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
  },
  heroContent: {
    maxWidth: Platform.OS === 'web' ? 640 : '100%',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.35)',
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.electricCyan,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 56 : 32,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 1.1,
    marginBottom: 16,
    letterSpacing: -1,
  },
  heroTitleAccent: {
    color: Colors.electricCyan,
  },
  heroSubtitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: Colors.textSecondary,
    lineHeight: 1.7,
    marginBottom: 30,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.electricCyan,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 180,
  },
  heroButtonPrimary: {},
  heroButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.bgDark,
  },
  heroButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    minWidth: 180,
  },
  heroButtonTextSecondary: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  heroVisual: {
    marginTop: Platform.OS === 'web' ? 60 : 30,
    width: '100%',
    alignItems: 'center',
  },
  heroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
  },
  catchmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.cardSurface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    minWidth: 160,
  },
  pillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pillThreat: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  pillSat: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 4,
  },
  section: {
    width: '100%',
    paddingHorizontal: Platform.OS === 'web' ? 80 : 20,
    paddingVertical: 80,
    alignItems: 'center',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 560,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  featureCard: {
    backgroundColor: Colors.cardSurface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    width: 300,
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 1.6,
  },
  ctaSection: {
    width: '100%',
    backgroundColor: Colors.cardElevated,
    borderRadius: 36,
    paddingHorizontal: Platform.OS === 'web' ? 80 : 24,
    paddingVertical: 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  ctaTitle: {
    fontSize: Platform.OS === 'web' ? 30 : 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 520,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.electricCyan,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.bgDark,
  },
  footer: {
    width: '100%',
    paddingHorizontal: Platform.OS === 'web' ? 80 : 20,
    paddingVertical: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 480,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footerLink: {
    paddingVertical: 4,
  },
  footerLinkText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  footerDivider: {
    color: Colors.textMuted,
    fontWeight: '700',
  },
});
