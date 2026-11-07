import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, UI } from '../theme/colors';
import { Catchment, LanguageCode } from '../types';
import { ACCRA_CATCHMENTS } from '../constants/catchments';
import { MapPin, Wifi, ShieldAlert, ChevronDown, Check, Building2, User } from 'lucide-react-native';

interface HeaderProps {
  currentCatchment: Catchment;
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

  const threatColor = Colors.threat[currentCatchment.current_threat_level].primary;

  return (
    <View style={styles.container}>
      {/* Top Status Row: App Branding + Mode Toggle */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.brandDot} />
          <Text style={styles.brandTitle}>SkyGround</Text>
          <View style={[styles.statusBadge, { borderColor: isOnline ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)' }]}>
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
          <View style={[styles.locationIconWrap, { backgroundColor: Colors.threat[currentCatchment.current_threat_level].bg }]}>
            <MapPin size={18} color={threatColor} />
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
        <View style={[styles.threatPill, { backgroundColor: Colors.threat[currentCatchment.current_threat_level].bg, borderColor: threatColor }]}>
          <Text style={[styles.threatPillText, { color: threatColor }]}>
            {currentCatchment.current_threat_level}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Language Chips */}
      <View style={styles.languageRow}>
        <Text style={styles.languageLabel}>Audio Alert Voice:</Text>
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
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.electricCyan,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardSurface,
    borderRadius: UI.borderRadius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: UI.borderRadius.pill,
  },
  modeButtonActive: {
    backgroundColor: Colors.electricCyan,
  },
  modeButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modeButtonTextActive: {
    color: Colors.bgDark,
    fontWeight: '700',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardSurface,
    borderRadius: UI.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  locationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: UI.borderRadius.md,
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
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  districtText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  threatPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1,
  },
  threatPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  languageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  languageChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: UI.borderRadius.pill,
    backgroundColor: Colors.cardSurface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  languageChipSelected: {
    backgroundColor: 'rgba(6, 182, 212, 0.16)',
    borderColor: Colors.electricCyan,
  },
  languageChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  languageChipTextSelected: {
    color: Colors.electricCyan,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.cardSurface,
    borderRadius: UI.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 16,
    marginTop: 2,
  },
  catchmentList: {
    gap: 8,
  },
  catchmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: Colors.cardElevated,
    borderRadius: UI.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  catchmentItemSelected: {
    borderColor: Colors.electricCyan,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
  },
  catchmentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  catchmentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catchmentItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  catchmentItemDistrict: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  catchmentItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catchmentItemThreat: {
    fontSize: 11,
    fontWeight: '700',
  },
  modalCloseButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: UI.borderRadius.md,
    backgroundColor: Colors.cardHighlight,
  },
  modalCloseButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});

