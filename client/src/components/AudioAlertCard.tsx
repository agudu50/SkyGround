import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors, UI } from '../theme/colors';
import { LanguageCode, ThreatLevel } from '../types';
import { AudioEngine } from '../services/audioEngine';
import { ApiClient } from '../services/apiClient';
import { AUDIO_SCRIPTS } from '../constants/audioMatrix';
import { Play, Pause, Volume2, Sparkles } from 'lucide-react-native';

interface AudioAlertCardProps {
  threatLevel: ThreatLevel;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  geminiAdvisoryText?: string;
}

export const AudioAlertCard: React.FC<AudioAlertCardProps> = ({
  threatLevel,
  selectedLanguage,
  onLanguageChange,
  geminiAdvisoryText,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(12);
  const [localizedText, setLocalizedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);

  const fallback = AUDIO_SCRIPTS[threatLevel][selectedLanguage];
  const threatTheme = Colors.threat[threatLevel];

  useEffect(() => {
    let isMounted = true;
    const prepareText = async () => {
      setIsTranslating(true);
      const textToTranslate = geminiAdvisoryText || fallback.script;
      const res = await ApiClient.translate(textToTranslate, selectedLanguage, threatLevel);
      if (isMounted) {
        setLocalizedText(res.translatedText);
        setIsTranslating(false);
      }
    };
    prepareText();
    return () => {
      isMounted = false;
    };
  }, [selectedLanguage, threatLevel, geminiAdvisoryText]);

  useEffect(() => {
    AudioEngine.setListener((status) => {
      setIsPlaying(status.isPlaying);
      setProgress(status.progressPct);
      setCurrentPosition(Math.round(status.positionSec));
      if (status.durationSec) {
        setDuration(Math.round(status.durationSec));
      }
      if (status.didJustFinish) {
        setIsPlaying(false);
        setProgress(0);
        setCurrentPosition(0);
      }
    });

    return () => {
      AudioEngine.stop();
      AudioEngine.setListener(null);
    };
  }, []);

  const handlePlayToggle = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}

    if (isPlaying) {
      await AudioEngine.pause();
    } else {
      const audioRes = await ApiClient.getTTS(
        localizedText || fallback.script,
        selectedLanguage,
        threatLevel
      );
      await AudioEngine.playUri(audioRes.audioUri, audioRes.durationSeconds);
    }
  };

  return (
    <View style={[styles.containerWrap, { borderColor: threatTheme.border }, UI.shadow.sm]}>
      <BlurView style={styles.cardBlur} intensity={16}>
        <View style={styles.cardContent}>
          {/* Top Header: Voice Indicator & Language Switcher */}
          <View style={styles.topRow}>
            <View style={styles.voiceTitleWrap}>
              <Volume2 size={17} color={threatTheme.primary} />
              <Text style={[styles.voiceTitle, { color: threatTheme.primary }]}>
                Broadcast Advisory ({fallback.languageName})
              </Text>
            </View>

            <View style={styles.langPillContainer}>
              {(['tw', 'gaa', 'en'] as LanguageCode[]).map((lang) => {
                const isSel = selectedLanguage === lang;
                const shortLabels: Record<LanguageCode, string> = {
                  tw: 'Twi',
                  gaa: 'Ga',
                  en: 'EN',
                };
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langPill, isSel && styles.langPillSelected]}
                    onPress={() => {
                      try { Haptics.selectionAsync(); } catch (e) {}
                      onLanguageChange(lang);
                    }}
                  >
                    <Text style={[styles.langPillText, isSel && styles.langPillTextActive]}>
                      {shortLabels[lang]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Script Text Snippet */}
          <Text style={styles.scriptText} numberOfLines={3}>
            {isTranslating ? 'Translating alert with Khaya AI...' : localizedText || fallback.script}
          </Text>

          {/* Pulsing Audio Waveform Visualizer */}
          <View style={styles.waveformRow}>
            {[14, 28, 42, 22, 36, 18, 46, 30, 20, 38, 26, 15, 32, 24, 40, 16].map((h, i) => {
              const barHeight = isPlaying ? Math.max(8, (h * ((i % 3) + 1.2)) % 46) : Math.max(6, h * 0.4);
              const barActive = progress > i / 16;
              return (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    {
                      height: barHeight,
                      backgroundColor: barActive ? threatTheme.primary : 'rgba(255, 255, 255, 0.12)',
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Playback Controls & Progress Bar */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: threatTheme.primary }]}
              onPress={handlePlayToggle}
              activeOpacity={0.8}
            >
              {isPlaying ? (
                <Pause size={24} color={Colors.bgDark} />
              ) : (
                <Play size={24} color={Colors.bgDark} style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.round(progress * 100)}%`,
                      backgroundColor: threatTheme.primary,
                    },
                  ]}
                />
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>
                  0:{currentPosition < 10 ? `0${currentPosition}` : currentPosition}
                </Text>
                <View style={styles.aiTag}>
                  <Sparkles size={11} color={Colors.textMuted} />
                  <Text style={styles.aiTagText}>Khaya Voice & Audio Matrix</Text>
                </View>
                <Text style={styles.timeText}>
                  0:{duration < 10 ? `0${duration}` : duration}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrap: {
    marginTop: 14,
    borderRadius: UI.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardBlur: {
    borderRadius: UI.borderRadius.lg,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  voiceTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  langPillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: UI.borderRadius.pill,
    padding: 2,
    gap: 3,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: UI.borderRadius.pill,
  },
  langPillSelected: {
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  langPillTextActive: {
    color: Colors.bgDark,
  },
  scriptText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 46,
    marginVertical: 4,
    paddingHorizontal: 6,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    ...UI.shadow.md,
  },
  progressContainer: {
    flex: 1,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
