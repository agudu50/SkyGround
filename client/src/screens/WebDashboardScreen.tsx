import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  ShieldAlert,
  ShieldCheck,
  Droplet,
  MapPin,
  Zap,
  Users,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Calendar,
  Clock,
  Building2,
} from 'lucide-react-native';
import { navigateTo, WebRoute } from '../navigation/WebRouter';
import { ApiClient, getAuthToken } from '../services/apiClient';

export const WebDashboardScreen: React.FC<{
  navigateTo: (r: WebRoute) => void;
  isAuthenticated: boolean;
  logout: () => void;
}> = ({ navigateTo, isAuthenticated, logout }) => {
  const [user, setUser] = useState<{ email?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ApiClient.me();
        if (res.ok && res.user) {
          setUser(res.user);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.electricCyan} />
        <Text style={styles.loaderText}>Loading dashboard…</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    navigateTo('/login');
    return null;
  }

  const catchments = [
    { id: 'odawna', name: 'Odawna Circle', district: 'Odawna', threat: 'AMBER' as const, sat: 78, rain: 24, elev: 74 },
    { id: 'adabraka', name: 'Adabraka Basin', district: 'Adabraka', threat: 'LOW' as const, sat: 52, rain: 8, elev: 68 },
    { id: 'alajo', name: 'Alajo Confluence', district: 'Alajo', threat: 'CRITICAL' as const, sat: 91, rain: 42, elev: 62 },
    { id: 'glefe', name: 'Glefe Lagoon', district: 'Glefe', threat: 'AMBER' as const, sat: 84, rain: 31, elev: 58 },
  ];

  const incidents = [
    { id: 'i1', type: 'CHOKED_GUTTER', neighborhood: 'Odawna Market Drain', time: '25m ago', verified: true, upvotes: 14 },
    { id: 'i2', type: 'HIGH_WATER', neighborhood: 'Sahara Park Culvert', time: '15m ago', verified: true, upvotes: 21 },
    { id: 'i3', type: 'IMPASSABLE_BRIDGE', neighborhood: 'Alajo Central Footbridge', time: '40m ago', verified: true, upvotes: 38 },
    { id: 'i4', type: 'STANDING_WATER', neighborhood: 'Glefe Lagoon Edge', time: '60m ago', verified: false, upvotes: 9 },
  ];

  const threatColor = (t: string) => {
    switch (t) {
      case 'CRITICAL': return Colors.crimsonEmergency;
      case 'AMBER': return Colors.amberWarning;
      default: return Colors.emeraldSuccess;
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Dashboard Header */}
      <View style={styles.navbar}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brand}>SkyGround</Text>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateTo('/')}
          >
            <Text style={styles.navButtonText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonActive]}
            onPress={() => navigateTo('/dashboard')}
          >
            <Text style={styles.navButtonTextActive}>Dashboard</Text>
          </TouchableOpacity>

          <View style={styles.userRow}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
              <Text style={styles.userRole}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Citizen'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                logout();
                navigateTo('/login');
              }}
            >
              <Text style={styles.logoutButtonText}>Sign out</Text>
              <LogOut size={16} color={Colors.textSecondary} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Welcome */}
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>
          Welcome back, {user?.email?.split('@')[0] || 'there'}.
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Here&rsquo;s what&rsquo;s happening across Greater Accra catchments right now.
        </Text>
      </View>

      {/* Stat Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderColor: 'rgba(34, 211, 238, 0.35)' }]}>
          <View style={styles.statIconWrap}>
            <MapPin size={20} color={Colors.electricCyan} />
          </View>
          <Text style={styles.statValue}>4</Text>
          <Text style={styles.statLabel}>Monitored catchments</Text>
        </View>
        <View style={[styles.statCard, { borderColor: 'rgba(248, 113, 113, 0.35)' }]}>
          <View style={styles.statIconWrap}>
            <AlertTriangle size={20} color={Colors.crimsonEmergency} />
          </View>
          <Text style={styles.statValue}>1</Text>
          <Text style={styles.statLabel}>Critical zones</Text>
        </View>
        <View style={[styles.statCard, { borderColor: 'rgba(251, 191, 36, 0.35)' }]}>
          <View style={styles.statIconWrap}>
            <Droplet size={20} color={Colors.amberWarning} />
          </View>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Amber watch zones</Text>
        </View>
        <View style={[styles.statCard, { borderColor: 'rgba(96, 165, 250, 0.35)' }]}>
          <View style={styles.statIconWrap}>
            <BarChart3 size={20} color={Colors.waterlogBlue} />
          </View>
          <Text style={styles.statValue}>4</Text>
          <Text style={styles.statLabel}>Active field reports</Text>
        </View>
      </View>

      {/* Catchment Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Catchment Overview</Text>
          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => navigateTo('/dashboard')}
          >
            <Text style={styles.viewAllText}>View all &rsaquo;</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.catchmentGrid}>
          {catchments.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catchmentCard, { borderColor: threatColor(c.threat) }]}
              onPress={() => navigateTo('/dashboard')}
            >
              <View style={styles.catchmentTop}>
                <View style={styles.catchmentLeft}>
                  <Text style={styles.catchmentName}>{c.name}</Text>
                  <Text style={styles.catchmentDistrict}>{c.district} &bull; {c.elev}m AMSL</Text>
                </View>
                <View style={[styles.threatPill, { backgroundColor: threatColor(c.threat) + '14', borderColor: threatColor(c.threat) }]}>
                  <Text style={[styles.threatPillText, { color: threatColor(c.threat) }]}>
                    {c.threat}
                  </Text>
                </View>
              </View>
              <View style={styles.catchmentMetrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{c.sat}%</Text>
                  <Text style={styles.metricLabel}>Soil saturation</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>{c.rain}mm</Text>
                  <Text style={styles.metricLabel}>24h rain</Text>
                </View>
              </View>
              <View style={styles.gaugeWrap}>
                <View style={styles.gaugeTrack}>
                  <View
                    style={[
                      styles.gaugeFill,
                      {
                        width: `${c.sat}%`,
                        backgroundColor: threatColor(c.threat),
                      },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Incidents */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderRow}>
            <Building2 size={18} color={Colors.electricCyan} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Recent Field Reports</Text>
          </View>
          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => navigateTo('/dashboard')}
          >
            <Text style={styles.viewAllText}>View all &rsaquo;</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.incidentsList}>
          {incidents.map((inc) => (
            <TouchableOpacity
              key={inc.id}
              style={styles.incidentRow}
              onPress={() => navigateTo('/dashboard')}
              activeOpacity={0.8}
            >
              <View style={[styles.incidentType, { backgroundColor: threatColor(inc.type) + '14', borderColor: threatColor(inc.type) }]}>
                <View
                  style={[
                    styles.incidentDot,
                    { backgroundColor: threatColor(inc.type) },
                  ]}
                />
                <Text style={[styles.incidentTypeText, { color: threatColor(inc.type) }]}>
                  {inc.type.replace('_', ' ')}
                </Text>
              </View>
              <View style={styles.incidentInfo}>
                <Text style={styles.incidentNeighborhood}>{inc.neighborhood}</Text>
                <Text style={styles.incidentTime}>{inc.time}</Text>
              </View>
              <View style={styles.incidentMeta}>
                <View style={styles.metaItem}>
                  <ShieldCheck size={12} color={inc.verified ? Colors.emeraldSuccess : Colors.textMuted} />
                  <Text style={[styles.metaText, { color: inc.verified ? Colors.emeraldSuccess : Colors.textMuted }]}>
                    {inc.verified ? 'Verified' : 'Unverified'}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={12} color={Colors.textMuted} />
                  <Text style={styles.metaText}>{inc.upvotes} confirms</Text>
                </View>
              </View>
              <ArrowRight size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionsGrid}>
          {[
            {
              icon: <MapPin size={22} color={Colors.crimsonEmergency} />,
              title: 'Report a Hazard',
              desc: '1-tap geo-tagged incident report',
              color: Colors.crimsonEmergency,
              onPress: () => navigateTo('/dashboard'),
            },
            {
              icon: <Zap size={22} color={Colors.electricCyan} />,
              title: 'Live Spatial Map',
              desc: 'Catchment polygons & waterlog layer',
              color: Colors.electricCyan,
              onPress: () => navigateTo('/dashboard'),
            },
            {
              icon: <Users size={22} color={Colors.waterlogBlue} />,
              title: 'Municipal Brief',
              desc: 'NADMO command & action plan',
              color: Colors.waterlogBlue,
              onPress: () => navigateTo('/dashboard'),
            },
            {
              icon: <Calendar size={22} color={Colors.amberWarning} />,
              title: 'Analytics',
              desc: 'Rainfall & saturation trends',
              color: Colors.amberWarning,
              onPress: () => navigateTo('/dashboard'),
            },
          ].map((a, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.actionCard, { borderColor: a.color + '26' }]}
              onPress={a.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.color + '14' }]}>
                {a.icon}
              </View>
              <Text style={styles.actionTitle}>{a.title}</Text>
              <Text style={styles.actionDesc}>{a.desc}</Text>
              <ArrowRight size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
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
    paddingBottom: 80,
  },
  content: {
    paddingHorizontal: Platform.OS === 'web' ? 80 : 20,
    paddingVertical: 20,
    minHeight: '100%',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgDark,
  },
  loaderText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 16,
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
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  navButtonActive: {
    backgroundColor: Colors.electricCyan,
    borderColor: Colors.electricCyan,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  navButtonTextActive: {
    color: Colors.bgDark,
    fontWeight: '800',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userRole: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.cardElevated,
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  welcome: {
    marginTop: Platform.OS === 'web' ? 100 : 40,
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardSurface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    minWidth: 170,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  section: {
    width: '100%',
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  viewAll: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.cardElevated,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  catchmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  catchmentCard: {
    backgroundColor: Colors.cardSurface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    width: Platform.OS === 'web' ? 280 : '48%',
    maxWidth: '100%',
  },
  catchmentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  catchmentLeft: {
    flex: 1,
  },
  catchmentName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  catchmentDistrict: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  threatPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  threatPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  catchmentMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  gaugeWrap: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeTrack: {
    height: '100%',
    width: '100%',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  incidentsList: {
    gap: 10,
  },
  incidentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardSurface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  incidentType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  incidentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  incidentTypeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  incidentInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  incidentNeighborhood: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  incidentTime: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  incidentMeta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  actionCard: {
    backgroundColor: Colors.cardSurface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    flex: 1,
    minWidth: 200,
    maxWidth: 260,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 14,
  },
});
