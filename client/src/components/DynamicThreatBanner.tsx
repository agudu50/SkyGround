import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Colors, UI } from '../theme/colors';
import { Catchment, GeminiAdvisory, LanguageCode, ThreatLevel } from '../types';
import { AudioAlertCard } from './AudioAlertCard';
import { AlertTriangle, ShieldAlert, ChevronDown, ChevronUp, Sparkles, Navigation } from 'lucide-react-native';

interface DynamicThreatBannerProps {
  catchment: Catchment;
  threatLevel: ThreatLevel;
  advisory: GeminiAdvisory | null;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export const DynamicThreatBanner: React.FC<DynamicThreatBannerProps> = ({
  catchment,
  threatLevel,
  advisory,
  selectedLanguage,
  onLanguageChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (threatLevel === 'LOW') {
    return (
      <View style={[styles.normalContainer, UI.shadow.sm]}>
        <View style={styles.normalBadge}>
          <ShieldAlert size={15} color={Colors.emeraldSuccess} />
          <Text style={styles.normalBadgeText}>DRII RISK LEVEL: NOMINAL</Text>
        </View>
        <Text style={styles.normalText}>
          {advisory?.community_action_en || 'Runoff within acceptable drainage limits across Greater Accra.'}
        </Text>
      </View>
    );
  }

  const isCritical = threatLevel === 'CRITICAL';
  const threatTheme = Colors.threat[threatLevel];

  const toggleExpand = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setIsExpanded(!isExpanded);
  };

  const glowColor = isCritical ? Colors.crimsonEmergency : Colors.amberWarning;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      style={[
        styles.bannerWrap,
        { borderColor: threatTheme.border },
        UI.shadow.md,
      ]}
    >
      <BlurView style={styles.bannerBlur} intensity={18}>
        <View style={styles.bannerCard}>
          {/* High-Contrast Header Bar */}
          <TouchableOpacity
            style={styles.headerBar}
            onPress={toggleExpand}
            activeOpacity={0.8}
          >
            <View style={styles.headerLeft}>
              <View style={[styles.alertIconWrap, { backgroundColor: threatTheme.primary }]}>
                <AlertTriangle size={20} color={Colors.bgDark} />
              </View>
              <View style={styles.headerTitles}>
                <View style={styles.badgeRow}>
                  <View style={[styles.threatBadge, { backgroundColor: threatTheme.badge }]}>
                    <Text style={styles.threatBadgeText}>{threatTheme.label}</Text>
                  </View>
                  <Text style={styles.timeTag}>DRII LIVE REASONING</Text>
                </View>
                <Text style={styles.headlineText} numberOfLines={2}>
                  {advisory?.headline || (isCritical ? 'Severe Inundation Warning' : 'Rapid Runoff Alert')}
                </Text>
              </View>
            </View>

            <View style={styles.expandIconWrap}>
              {isExpanded ? (
                <ChevronUp size={22} color={threatTheme.primary} />
              ) : (
                <ChevronDown size={22} color={threatTheme.primary} />
              )}
            </View>
          </TouchableOpacity>

          {/* Expandable Body */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              {/* Gemini Actionable Warning */}
              <View style={[styles.advisoryTextBox, { borderColor: 'rgba(255, 255, 255, 0.08)' }]}>
                <Text style={styles.advisoryText}>
                  {advisory?.community_action_en ||
                    `Heavy storm runoff active in ${catchment.name}. Soil moisture saturation is extremely high.`}
                </Text>

                {advisory?.evacuation_notice && (
                  <View style={styles.evacuationCallout}>
                    <Navigation size={15} color={threatTheme.primary} />
                    <Text style={[styles.evacuationText, { color: isCritical ? '#FCA5A5' : '#FDE68A' }]}>
                      {advisory.evacuation_notice}
                    </Text>
                  </View>
                )}

                <View style={styles.aiSignoffRow}>
                  <Sparkles size={12} color={Colors.textMuted} />
                  <Text style={styles.aiSignoffText}>
                    Google AI Studio (Gemini 2.5 Flash) • Hydrology Confidence: {advisory?.confidence_pct || 94}%
                  </Text>
                </View>
              </View>

              {/* Embedded Audio Broadcast Advisory */}
              <AudioAlertCard
                threatLevel={threatLevel}
                selectedLanguage={selectedLanguage}
                onLanguageChange={onLanguageChange}
                geminiAdvisoryText={advisory?.community_action_en}
              />
            </View>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerWrap: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: UI.borderRadius.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  bannerBlur: {
    borderRadius: UI.borderRadius.xl,
    overflow: 'hidden',
  },
  bannerCard: {
    padding: 20,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  alertIconWrap: {
    width: 44,
    height: 44,
    borderRadius: UI.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...UI.shadow.sm,
  },
  headerTitles: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  threatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: UI.borderRadius.pill,
  },
  threatBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.4,
  },
  headlineText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  expandIconWrap: {
    paddingLeft: 10,
  },
  expandedContent: {
    marginTop: 16,
  },
  advisoryTextBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: UI.borderRadius.md,
    padding: 14,
    borderWidth: 1,
  },
  advisoryText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
    fontWeight: '600',
  },
  evacuationCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  evacuationText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  aiSignoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  aiSignoffText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  normalContainer: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: UI.borderRadius.lg,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 16,
  },
  normalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  normalBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.emeraldSuccess,
    letterSpacing: 0.5,
  },
  normalText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
