import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors, UI } from '../theme/colors';
import { Catchment, LanguageCode } from '../types';
import { ACCRA_CATCHMENTS } from '../constants/catchments';
import { MapPin, Wifi, ShieldAlert, ChevronDown, Check, Building2, User } from 'lucide-react-native';

interface HeaderProps {  currentCatchment: Catchment;
  onSelectCatchment: (c: Catchment) => void;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  isOnline: boolean;
  viewMode: 'citizen' | 'municipal';
  onToggleViewMode: (mode: 'citizen' | 'municipal') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCatchment,
  onSelectCatchment,
  selectedLanguage,
  onSelectLanguage,
  isOnline,
  viewMode,
  onToggleViewMode,
}) => {
  const [isCatchmentModalVisible, setCatchmentModalVisible] = useState(false);

  const handleLanguageChange = (lang: LanguageCode) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onSelectLanguage(lang);
  };

  const threatTheme = Colors.threat[currentCatchment.current_threat_level];

  return (
    <View style={styles.container}>
      {/* Top Status Row: App Branding + Mode Toggle */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.brandDot} />
          <Text style={styles.brandTitle}>SkyGround</Text>
          <View style={[styles.statusBadge, { borderColor: isOnline ? 'rgba(52, 211, 153, 0.35)' : 'rgba(251, 191, 36, 0.35)' }]}>
            <Wifi size={11} color={isOnline ? Colors.emeraldSuccess : Colors.amberWarning} />
            <Text style={[styles.statusBadgeText, { color: isOnline ? Colors.emeraldSuccess : Colors.amberWarning }]}>
              {isOnline ? 'POSTGIS LIVE' : 'OFFLINE MATRIX'}
            </Text>
          </View>
        </View>

        {/* View Switcher: Citizen vs Municipal */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, viewMode === 'citizen' && styles.modeButtonActive]}
            onPress={() => {
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}
              onToggleViewMode('citizen');
            }}
            activeOpacity={0.8}
          >
            <User size={14} color={viewMode === 'citizen' ? Colors.bgDark : Colors.textSecondary} />
            <Text style={[styles.modeButtonText, viewMode === 'citizen' && styles.modeButtonTextActive]}>
              Citizen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeButton, viewMode === 'municipal' && styles.modeButtonActive]}
            onPress={() => {
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}
              onToggleViewMode('municipal');
            }}
            activeOpacity={0.8}
          >
            <Building2 size={14} color={viewMode === 'municipal' ? Colors.bgDark : Colors.textSecondary} />
            <Text style={[styles.modeButtonText, viewMode === 'municipal' && styles.modeButtonTextActive]}>
              NADMO
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Bar + Catchment Switcher */}
      <TouchableOpacity
        style={styles.locationBar}
        onPress={() => {
          try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}
          setCatchmentModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.locationLeft}>
          <View style={[styles.locationIconWrap, { backgroundColor: threatTheme.bg }]}>
            <MapPin size={18} color={threatTheme.primary} />
          </View>
          <View style={styles.locationTextContainer}>
            <View style={styles.locationTitleRow}>
              <Text style={styles.neighborhoodText} numberOfLines={1}>
                {currentCatchment.name}
              </Text>
              <ChevronDown size={14} color={Colors.textSecondary} style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.districtText} numberOfLines={1}>
              {currentCatchment.district} • {currentCatchment.base_elevation_m}m AMSL
            </Text>
          </View>
        </View>

        {/* Threat Pill */}
        <View style={[styles.threatPill, { backgroundColor: threatTheme.bg, borderColor: threatTheme.border }]}>
          <Text style={[styles.threatPillText, { color: threatTheme.primary }]}>
            {currentCatchment.current_threat_level}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Language Chips */}
      <View style={styles.languageRow}>
        <Text style={styles.languageLabel}>Audio Alert Voice</Text>
        <View style={styles.chipsContainer}>
          {(['tw', 'gaa', 'en'] as LanguageCode[]).map((lang) => {
            const isSelected = selectedLanguage === lang;
            const labels: Record<LanguageCode, string> = {
              tw: 'Twi (Akan)',
              gaa: 'Ga (Gã)',
              en: 'English',
            };
            return (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageChip,
                  isSelected && styles.languageChipSelected,
                ]}
                onPress={() => handleLanguageChange(lang)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.languageChipText,
                    isSelected && styles.languageChipTextSelected,
                  ]}
                >
                  {labels[lang]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Catchment Selector Modal */}
      <Modal
        visible={isCatchmentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCatchmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView style={styles.modalBlur} intensity={20}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Greater Accra Catchment</Text>
              <Text style={styles.modalSubtitle}>
                Target flood-vulnerable urban hydrology zones
              </Text>

              <View style={styles.catchmentList}>
                {ACCRA_CATCHMENTS.map((c) => {
                  const isSelected = c.id === currentCatchment.id;
                  const cThreatColor = Colors.threat[c.current_threat_level].primary;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.catchmentItem,
                        isSelected && styles.catchmentItemSelected,
                      ]}
                      onPress={() => {
                        try { Haptics.selectionAsync(); } catch(e) {}
                        onSelectCatchment(c);
                        setCatchmentModalVisible(false);
                      }}
                    >
                      <View style={styles.catchmentItemLeft}>
                        <View style={[styles.catchmentDot, { backgroundColor: cThreatColor }]} />
                        <View>
                          <Text style={styles.catchmentItemName}>{c.name}</Text>
                          <Text style={styles.catchmentItemDistrict}>{c.district} • {c.drainage_outfall}</Text>
                        </View>
                      </View>
                      <View style={styles.catchmentItemRight}>
                        <Text style={[styles.catchmentItemThreat, { color: cThreatColor }]}>
                          {c.current_threat_level}
                        </Text>
                        {isSelected && <Check size={16} color={Colors.electricCyan} style={{ marginLeft: 6 }} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setCatchmentModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.electricCyan,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardSurface,
    borderRadius: UI.borderRadius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    ...UI.shadow.sm,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: UI.borderRadius.pill,
  },
  modeButtonActive: {
    backgroundColor: Colors.electricCyan,
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  modeButtonTextActive: {
    color: Colors.bgDark,
    fontWeight: '800',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardSurface,
    borderRadius: UI.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    ...UI.shadow.md,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  locationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: UI.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  neighborhoodText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  districtText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  threatPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1.5,
  },
  threatPillText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  languageLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.4,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  languageChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: UI.borderRadius.pill,
    backgroundColor: Colors.cardSurface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    ...UI.shadow.sm,
  },
  languageChipSelected: {
    backgroundColor: 'rgba(34, 211, 238, 0.16)',
    borderColor: Colors.electricCyan,
  },
  languageChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  languageChipTextSelected: {
    color: Colors.electricCyan,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 4, 8, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.cardSurface,
    borderRadius: UI.borderRadius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    ...UI.shadow.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 18,
    marginTop: 4,
  },
  catchmentList: {
    gap: 10,
  },
  catchmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: Colors.cardElevated,
    borderRadius: UI.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    ...UI.shadow.sm,
  },
  catchmentItemSelected: {
    borderColor: Colors.electricCyan,
    backgroundColor: 'rgba(34, 211, 238, 0.06)',
  },
  catchmentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  catchmentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  catchmentItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  catchmentItemDistrict: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  catchmentItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catchmentItemThreat: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalCloseButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: UI.borderRadius.md,
    backgroundColor: Colors.cardHighlight,
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
});
