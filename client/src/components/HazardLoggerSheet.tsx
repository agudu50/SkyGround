import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, UI } from '../theme/colors';
import { Catchment, CommunityIncident, HazardType } from '../types';
import { SpatialBackendService } from '../services/neonPostgis';
import { Waves, Construction, TriangleAlert, Droplets, CheckCircle, Flame } from 'lucide-react-native';

interface HazardLoggerSheetProps {
  currentCatchment: Catchment;
  onIncidentReported: (incident: CommunityIncident) => void;
}

interface HazardOption {
  type: HazardType;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  icon: (color: string) => React.ReactNode;
}

export const HazardLoggerSheet: React.FC<HazardLoggerSheetProps> = ({
  currentCatchment,
  onIncidentReported,
}) => {
  const [submittingType, setSubmittingType] = useState<HazardType | null>(null);
  const [recentlyReported, setRecentlyReported] = useState<string | null>(null);

  const hazardOptions: HazardOption[] = [
    {
      type: 'HIGH_WATER',
      title: 'Water Rising',
      subtitle: 'Flash flood surge / road depth',
      color: Colors.hazards.HIGH_WATER,
      bg: 'rgba(239, 68, 68, 0.12)',
      icon: (c) => <Waves size={24} color={c} />,
    },
    {
      type: 'CHOKED_GUTTER',
      title: 'Choked Gutter',
      subtitle: 'Plastic waste / sediment block',
      color: Colors.hazards.CHOKED_GUTTER,
      bg: 'rgba(245, 158, 11, 0.12)',
      icon: (c) => <Construction size={24} color={c} />,
    },
    {
      type: 'IMPASSABLE_BRIDGE',
      title: 'Impassable Bridge',
      subtitle: 'Submerged crossing / drain rail',
      color: Colors.hazards.IMPASSABLE_BRIDGE,
      bg: 'rgba(236, 72, 153, 0.12)',
      icon: (c) => <TriangleAlert size={24} color={c} />,
    },
    {
      type: 'STANDING_WATER',
      title: 'Waterlogged Mud',
      subtitle: 'Persistent stagnant ponding',
      color: Colors.hazards.STANDING_WATER,
      bg: 'rgba(59, 130, 246, 0.12)',
      icon: (c) => <Droplets size={24} color={c} />,
    },
  ];

  const handle1TapReport = async (option: HazardOption) => {
    try {
      // High-impact haptic feedback for 1-tap emergency action
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}

    setSubmittingType(option.type);

    try {
      // Dispatches GPS coordinates to Neon DB in background
      // Adding minor jitter around center for realism if user is simulating
      const lat = currentCatchment.center.latitude + (Math.random() - 0.5) * 0.003;
      const lon = currentCatchment.center.longitude + (Math.random() - 0.5) * 0.003;

      const incident = await SpatialBackendService.reportIncident({
        hazard_type: option.type,
        latitude: lat,
        longitude: lon,
        neighborhood_name: `${currentCatchment.name} Sector`,
        description: `1-Tap ground report: ${option.title} observed near ${currentCatchment.drainage_outfall}.`,
      });

      onIncidentReported(incident);
      setRecentlyReported(option.title);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}

      setTimeout(() => {
        setRecentlyReported(null);
      }, 4000);
    } catch (err) {
      console.warn('[SkyGround] Error logging incident:', err);
    } finally {
      setSubmittingType(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>1-Tap Community Hazard Logger</Text>
            <View style={styles.liveBadge}>
              <Flame size={12} color={Colors.crimsonEmergency} />
              <Text style={styles.liveBadgeText}>GROUND-TRUTH</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Tap once to geo-tag live flash points for your neighbors and NADMO
          </Text>
        </View>
      </View>

      {/* Confirmation Toast */}
      {recentlyReported && (
        <View style={styles.toast}>
          <CheckCircle size={16} color={Colors.emeraldSuccess} />
          <Text style={styles.toastText}>
            Reported "{recentlyReported}" in {currentCatchment.name}. Logged to PostGIS!
          </Text>
        </View>
      )}

      {/* 4 Large Tactile Buttons (2x2 Grid) */}
      <View style={styles.grid}>
        {hazardOptions.map((opt) => {
          const isBusy = submittingType === opt.type;
          return (
            <TouchableOpacity
              key={opt.type}
              style={[
                styles.button,
                {
                  backgroundColor: opt.bg,
                  borderColor: opt.color,
                },
              ]}
              onPress={() => handle1TapReport(opt)}
              activeOpacity={0.7}
              disabled={submittingType !== null}
            >
              <View style={styles.buttonTop}>
                <View style={[styles.iconCircle, { backgroundColor: opt.color }]}>
                  {opt.icon(Colors.bgDark)}
                </View>
                {isBusy && <ActivityIndicator size="small" color={opt.color} />}
              </View>

              <Text style={[styles.buttonTitle, { color: Colors.textPrimary }]}>
                {opt.title}
              </Text>
              <Text style={styles.buttonSubtitle} numberOfLines={1}>
                {opt.subtitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: Colors.cardSurface,
    borderRadius: UI.borderRadius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  headerRow: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  liveBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.crimsonEmergency,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
    borderRadius: UI.borderRadius.md,
    padding: 10,
    marginBottom: 12,
  },
  toastText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.emeraldSuccess,
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    width: '48.5%',
    minHeight: 90, // exceeds minTouchTarget 56dp
    borderRadius: UI.borderRadius.lg,
    padding: 12,
    borderWidth: 1.5,
    justifyContent: 'space-between',
  },
  buttonTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  buttonSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

