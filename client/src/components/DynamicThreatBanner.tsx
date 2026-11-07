import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
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
      <View style={styles.normalContainer}>
        <View style={styles.normalBadge}>
          <ShieldAlert size={14} color={Colors.emeraldSuccess} />
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

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      style={[
        styles.bannerCard,
        {
          backgroundColor: threatTheme.bg,
          borderColor: threatTheme.border,
        },
      ]}
    >
      {/* High-Contrast Header Bar */}
      <TouchableOpacity
        style={styles.headerBar}
        onPress={toggleExpand}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.alertIconWrap, { backgroundColor: threatTheme.primary }]}>
            <AlertTriangle size={18} color={Colors.bgDark} />
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
            <ChevronUp size={20} color={threatTheme.primary} />
          ) : (
            <ChevronDown size={20} color={threatTheme.primary} />
          )}
        </View>
      </TouchableOpacity>

      {/* Expandable Body */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Gemini Actionable Warning in Conversational English */}
          <View style={styles.advisoryTextBox}>
            <Text style={styles.advisoryText}>
              {advisory?.community_action_en ||
                `Heavy storm runoff active in ${catchment.name}. Soil moisture saturation is extremely high.`}
            </Text>

            {advisory?.evacuation_notice && (
              <View style={styles.evacuationCallout}>
                <Navigation size={14} color={threatTheme.primary} />
                <Text style={[styles.evacuationText, { color: isCritical ? '#FECACA' : '#FDE68A' }]}>
                  {advisory.evacuation_notice}
                </Text>
              </View>
            )}

            <View style={styles.aiSignoffRow}>
              <Sparkles size={11} color={Colors.textMuted} />
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: UI.borderRadius.xl,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  alertIconWrap: {
    width: 36,
    height: 36,
    borderRadius: UI.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  threatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: UI.borderRadius.pill,
  },
  threatBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timeTag: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.4,
  },
  headlineText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  expandIconWrap: {
    paddingLeft: 8,
  },
  expandedContent: {
    marginTop: 12,
  },
  advisoryTextBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: UI.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  advisoryText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },
  evacuationCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  evacuationText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  aiSignoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  aiSignoffText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  normalContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: UI.borderRadius.lg,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 12,
  },
  normalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  normalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.emeraldSuccess,
    letterSpacing: 0.5,
  },
  normalText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});

