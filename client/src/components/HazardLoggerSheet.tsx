import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
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
      bg: 'rgba(248, 113, 113, 0.14)',
      icon: (c) => <Waves size={26} color={c} />,
    },
    {
      type: 'CHOKED_GUTTER',
      title: 'Choked Gutter',
      subtitle: 'Plastic waste / sediment block',
      color: Colors.hazards.CHOKED_GUTTER,
      bg: 'rgba(251, 191, 36, 0.14)',
      icon: (c) => <Construction size={26} color={c} />,
    },
    {
      type: 'IMPASSABLE_BRIDGE',
      title: 'Impassable Bridge',
      subtitle: 'Submerged crossing / drain rail',
      color: Colors.hazards.IMPASSABLE_BRIDGE,
      bg: 'rgba(244, 114, 182, 0.14)',
      icon: (c) => <TriangleAlert size={26} color={c} />,
    },
    {
      type: 'STANDING_WATER',
      title: 'Waterlogged Mud',
      subtitle: 'Persistent stagnant ponding',
      color: Colors.hazards.STANDING_WATER,
      bg: 'rgba(96, 165, 250, 0.14)',
      icon: (c) => <Droplets size={26} color={c} />,
    },
  ];

  const handle1TapReport = async (option: HazardOption) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}

    setSubmittingType(option.type);

    try {
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
    <View style={[styles.containerWrap, UI.shadow.lg]}>
      <BlurView style={styles.cardBlur} intensity={18}>
        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.title}>1-Tap Community Hazard Logger</Text>
                <View style={styles.liveBadge}>
                  <Flame size={13} color={Colors.crimsonEmergency} />
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
            <View style={[styles.toast, { borderColor: 'rgba(52, 211, 153, 0.4)' }]}>
              <CheckCircle size={17} color={Colors.emeraldSuccess} />
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
                    isBusy && styles.buttonBusy,
                  ]}
                  onPress={() => handle1TapReport(opt)}
                  activeOpacity={0.75}
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
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrap: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: UI.borderRadius.xl,
    overflow: 'hidden',
  },
  cardBlur: {
    borderRadius: UI.borderRadius.xl,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 22,
  },
  headerRow: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.crimsonEmergency,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(52, 211, 153, 0.14)',
    borderWidth: 1.5,
    borderRadius: UI.borderRadius.md,
    padding: 12,
    marginBottom: 14,
  },
  toastText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.emeraldSuccess,
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    width: '48%',
    minHeight: 112,
    borderRadius: UI.borderRadius.lg,
    padding: 16,
    borderWidth: 1.5,
    justifyContent: 'space-between',
    ...UI.shadow.sm,
  },
  buttonBusy: {
    opacity: 0.6,
  },
  buttonTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    ...UI.shadow.sm,
  },
  buttonTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  buttonSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
});
