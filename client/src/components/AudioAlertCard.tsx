import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

  // Fetch or prepare translated text when language or threat level changes
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

  // Hook up AudioEngine listener
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

  const threatColor = Colors.threat[threatLevel].primary;

  return (
    <View style={[styles.container, { borderColor: Colors.threat[threatLevel].border }]}>
      {/* Top Header: Voice Indicator & Language Switcher */}
      <View style={styles.topRow}>
        <View style={styles.voiceTitleWrap}>
          <Volume2 size={16} color={threatColor} />
          <Text style={[styles.voiceTitle, { color: threatColor }]}>
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
                style={[styles.langPill, isSel && { backgroundColor: threatColor }]}
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
          const barHeight = isPlaying ? Math.max(8, (h * ((i % 3) + 1.2)) % 44) : Math.max(6, h * 0.4);
          const barActive = progress > i / 16;
          return (
            <View
              key={i}
              style={[
                styles.waveformBar,
                {
                  height: barHeight,
                  backgroundColor: barActive ? threatColor : 'rgba(255, 255, 255, 0.15)',
                },
              ]}
            />
          );
        })}
      </View>

      {/* Playback Controls & Progress Bar */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: threatColor }]}
          onPress={handlePlayToggle}
          activeOpacity={0.8}
        >
          {isPlaying ? (
            <Pause size={22} color={Colors.bgDark} />
          ) : (
            <Play size={22} color={Colors.bgDark} style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.round(progress * 100)}%`,
                  backgroundColor: threatColor,
                },
              ]}
            />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>0:{currentPosition < 10 ? `0${currentPosition}` : currentPosition}</Text>
            <View style={styles.aiTag}>
              <Sparkles size={10} color={Colors.textMuted} />
              <Text style={styles.aiTagText}>Khaya Voice & Audio Matrix</Text>
            </View>
            <Text style={styles.timeText}>0:{duration < 10 ? `0${duration}` : duration}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(11, 15, 23, 0.75)',
    borderRadius: UI.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voiceTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voiceTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  langPillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: UI.borderRadius.pill,
    padding: 2,
    gap: 2,
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: UI.borderRadius.pill,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  langPillTextActive: {
    color: Colors.bgDark,
  },
  scriptText: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 10,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    marginVertical: 4,
    paddingHorizontal: 6,
  },
  waveformBar: {
    width: 3.5,
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  progressContainer: {
    flex: 1,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  aiTagText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
