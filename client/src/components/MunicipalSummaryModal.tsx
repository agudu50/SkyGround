import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, UI } from '../theme/colors';
import { Catchment, CommunityIncident, GeminiAdvisory, MunicipalBrief } from '../types';
import { ACCRA_CATCHMENTS } from '../constants/catchments';
import {
  Building2,
  FileText,
  AlertTriangle,
  Wrench,
  Truck,
  CheckCircle2,
  Share2,
  ShieldAlert,
} from 'lucide-react-native';

interface MunicipalSummaryModalProps {
  currentCatchment: Catchment;
  incidents: CommunityIncident[];
  advisory: GeminiAdvisory | null;
  onClose: () => void;
}

export const MunicipalSummaryModal: React.FC<MunicipalSummaryModalProps> = ({
  currentCatchment,
  incidents,
  advisory,
  onClose,
}) => {
  const [briefGenerated, setBriefGenerated] = useState(false);

  const chokedGutters = incidents.filter((i) => i.hazard_type === 'CHOKED_GUTTER');
  const highWater = incidents.filter((i) => i.hazard_type === 'HIGH_WATER');
  const impassableBridges = incidents.filter((i) => i.hazard_type === 'IMPASSABLE_BRIDGE');
  const waterloggedZones = ACCRA_CATCHMENTS.filter((c) => c.soil_saturation_pct > 80);

  const handleGenerateBrief = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
    setBriefGenerated(true);
  };

  const handleShareBrief = async () => {
    try {
      await Share.share({
        title: `SkyGround NADMO Action Brief - ${currentCatchment.district}`,
        message: `🚨 SKYGOUND MUNICIPAL ACTION BRIEF\nDistrict: ${currentCatchment.district}\nCatchment: ${currentCatchment.name}\nThreat Level: ${currentCatchment.current_threat_level}\nChoked Gutters: ${chokedGutters.length}\nWaterlogged Zones: ${waterloggedZones.map((z) => z.name).join(', ')}\n\nENGINEERING DIRECTIVES:\n1. ${advisory?.public_works_directives[0]}\n2. ${advisory?.public_works_directives[1]}\n3. ${advisory?.public_works_directives[2]}\n\nIssued via SkyGround PostGIS & Gemini Reasoning.`,
      });
    } catch (e) {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Building2 size={22} color={Colors.amberWarning} />
          <View>
            <Text style={styles.title}>Municipal & NADMO Command Brief</Text>
            <Text style={styles.subtitle}>
              District Engineering & Desilting Operations • {currentCatchment.district}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Return to Citizen View</Text>
        </TouchableOpacity>
      </View>

      {/* District KPI Metrics Cards */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { borderColor: Colors.hazards.CHOKED_GUTTER }]}>
          <Text style={[styles.kpiValue, { color: Colors.hazards.CHOKED_GUTTER }]}>
            {chokedGutters.length}
          </Text>
          <Text style={styles.kpiLabel}>Choked Arterials</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: Colors.hazards.HIGH_WATER }]}>
          <Text style={[styles.kpiValue, { color: Colors.hazards.HIGH_WATER }]}>
            {highWater.length}
          </Text>
          <Text style={styles.kpiLabel}>Active Inundations</Text>
        </View>

        <View style={[styles.kpiCard, { borderColor: Colors.waterlogBlue }]}>
          <Text style={[styles.kpiValue, { color: Colors.waterlogBlue }]}>
            {waterloggedZones.length}
          </Text>
          <Text style={styles.kpiLabel}>Saturated Catchments</Text>
        </View>
      </View>

      {/* 3-Bullet Public Works Directives (From Gemini Synthesis) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Wrench size={16} color={Colors.electricCyan} />
          <Text style={styles.sectionTitle}>Gemini AI Public Works Engineering Plan</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Generated from live soil moisture, rainfall accumulation, and PostGIS terrain contours:
        </Text>

        <View style={styles.directivesList}>
          {advisory?.public_works_directives.map((directive, idx) => (
            <View key={idx} style={styles.directiveItem}>
              <View style={styles.directiveIndexWrap}>
                <Text style={styles.directiveIndex}>{idx + 1}</Text>
              </View>
              <Text style={styles.directiveText}>{directive}</Text>
            </View>
          )) || (
            <Text style={styles.directiveText}>
              • Dispatch desilting excavators to primary outfall culverts.{'\n'}
              • Clear plastic waste blockages along main drainage channels.{'\n'}
              • Stage standby emergency pumps at low-lying depression junctions.
            </Text>
          )}
        </View>
      </View>

      {/* Desilting Priority Clusters */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Truck size={16} color={Colors.amberWarning} />
          <Text style={styles.sectionTitle}>Desilting Priority Zones (Odaw / Klottey Basin)</Text>
        </View>

        <View style={styles.zoneList}>
          <View style={styles.zoneRow}>
            <View style={styles.zoneDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.zoneName}>Odawna VIP Station Culvert</Text>
              <Text style={styles.zoneNotes}>Critical choked drain. High risk of commercial vehicle terminal submergence.</Text>
            </View>
            <View style={styles.priorityBadgeImmediate}>
              <Text style={styles.priorityBadgeText}>IMMEDIATE</Text>
            </View>
          </View>

          <View style={styles.zoneRow}>
            <View style={[styles.zoneDot, { backgroundColor: Colors.amberWarning }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.zoneName}>Adabraka Sahara Storm Ditch</Text>
              <Text style={styles.zoneNotes}>High sediment accumulation reducing conveyance by 60%.</Text>
            </View>
            <View style={styles.priorityBadgeHigh}>
              <Text style={styles.priorityBadgeText}>NEXT 6H</Text>
            </View>
          </View>

          <View style={styles.zoneRow}>
            <View style={[styles.zoneDot, { backgroundColor: Colors.waterlogBlue }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.zoneName}>Glefe Lagoon Barrier Inflow</Text>
              <Text style={styles.zoneNotes}>Prolonged 92% soil waterlogging with trapped saline backwater.</Text>
            </View>
            <View style={styles.priorityBadgeWaterlog}>
              <Text style={styles.priorityBadgeText}>POST-STORM</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Assembly Action Brief Generation Button */}
      <TouchableOpacity
        style={styles.generateButton}
        onPress={handleGenerateBrief}
        activeOpacity={0.8}
      >
        <FileText size={18} color={Colors.bgDark} />
        <Text style={styles.generateButtonText}>
          {briefGenerated ? 'Assembly Action Brief Generated' : 'Generate Assembly Action Brief'}
        </Text>
      </TouchableOpacity>

      {briefGenerated && (
        <View style={styles.briefSummaryCard}>
          <View style={styles.briefSuccessHeader}>
            <CheckCircle2 size={18} color={Colors.emeraldSuccess} />
            <Text style={styles.briefSuccessTitle}>
              Action Brief #SG-{currentCatchment.id.toUpperCase()}-2026 Ready
            </Text>
          </View>
          <Text style={styles.briefSummaryText}>
            Compiled with {incidents.length} geo-tagged incident coordinates, Gemini 2.5 Flash engineering directives, and PostGIS catchment boundary contours.
          </Text>

          <TouchableOpacity style={styles.shareButton} onPress={handleShareBrief}>
            <Share2 size={16} color={Colors.electricCyan} />
            <Text style={styles.shareButtonText}>Transmit to District Chief Executive & NADMO</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    backgroundColor: Colors.cardSurface,
    borderRadius: UI.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.cardElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  closeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.electricCyan,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: Colors.cardSurface,
    borderRadius: UI.borderRadius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: Colors.cardSurface,
    borderRadius: UI.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  directivesList: {
    gap: 10,
  },
  directiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.cardElevated,
    padding: 10,
    borderRadius: UI.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  directiveIndexWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.electricCyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  directiveIndex: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.bgDark,
  },
  directiveText: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
  zoneList: {
    gap: 8,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.cardElevated,
    padding: 10,
    borderRadius: UI.borderRadius.md,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.crimsonEmergency,
  },
  zoneName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  zoneNotes: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  priorityBadgeImmediate: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.crimsonEmergency,
  },
  priorityBadgeHigh: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.amberWarning,
  },
  priorityBadgeWaterlog: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.waterlogBlue,
  },
  priorityBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.electricCyan,
    paddingVertical: 14,
    borderRadius: UI.borderRadius.lg,
    marginBottom: 12,
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.bgDark,
  },
  briefSummaryCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: UI.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 20,
  },
  briefSuccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  briefSuccessTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.emeraldSuccess,
  },
  briefSummaryText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.cardSurface,
    paddingVertical: 10,
    borderRadius: UI.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.electricCyan,
  },
});

