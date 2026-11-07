import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type PlaybackListener = (status: {
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  didJustFinish: boolean;
  progressPct: number;
}) => void;

class AudioEngineClass {
  private sound: Audio.Sound | null = null;
  private currentUri: string | null = null;
  private isConfigured: boolean = false;
  private listener: PlaybackListener | null = null;

  async setup() {
    if (this.isConfigured) return;
    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      }
      this.isConfigured = true;
    } catch (err) {
      console.warn('[SkyGround AudioEngine] Setup error:', err);
    }
  }

  setListener(fn: PlaybackListener | null) {
    this.listener = fn;
  }

  async playUri(uri: string, durationEstimateSec: number = 12) {
    await this.setup();

    try {
      // Provide immediate crisp haptic feedback on play
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (hapticErr) {
        // Haptics optional on web
      }

      if (this.sound) {
        if (this.currentUri === uri) {
          const status = await this.sound.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await this.sound.pauseAsync();
              return;
            } else {
              await this.sound.playAsync();
              return;
            }
          }
        }
        await this.sound.unloadAsync();
        this.sound = null;
      }

      this.currentUri = uri;
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, isLooping: false },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
    } catch (err) {
      console.warn('[SkyGround AudioEngine] Error playing sound:', err);
      // Fallback timer simulation if native sound fails to load on restricted environment
      this.simulatePlayback(durationEstimateSec);
    }
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const duration = (status.durationMillis || 10000) / 1000;
    const position = status.positionMillis / 1000;
    const progress = Math.min(1.0, position / Math.max(duration, 1));

    if (this.listener) {
      this.listener({
        isPlaying: status.isPlaying,
        positionSec: position,
        durationSec: duration,
        didJustFinish: status.didJustFinish,
        progressPct: progress,
      });
    }

    if (status.didJustFinish) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {}
    }
  };

  private simulateTimer: any = null;
  private simulatePlayback(totalDurationSec: number) {
    if (this.simulateTimer) clearInterval(this.simulateTimer);
    let currentSec = 0;

    if (this.listener) {
      this.listener({
        isPlaying: true,
        positionSec: 0,
        durationSec: totalDurationSec,
        didJustFinish: false,
        progressPct: 0,
      });
    }

    this.simulateTimer = setInterval(() => {
      currentSec += 0.5;
      const progress = Math.min(1.0, currentSec / totalDurationSec);

      if (this.listener) {
        this.listener({
          isPlaying: currentSec < totalDurationSec,
          positionSec: currentSec,
          durationSec: totalDurationSec,
          didJustFinish: currentSec >= totalDurationSec,
          progressPct: progress,
        });
      }

      if (currentSec >= totalDurationSec) {
        clearInterval(this.simulateTimer);
        this.simulateTimer = null;
      }
    }, 500);
  }

  async pause() {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
      }
      if (this.simulateTimer) {
        clearInterval(this.simulateTimer);
        this.simulateTimer = null;
      }
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    } catch (err) {
      console.warn('[SkyGround AudioEngine] Pause error:', err);
    }
  }

  async stop() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.currentUri = null;
      }
      if (this.simulateTimer) {
        clearInterval(this.simulateTimer);
        this.simulateTimer = null;
      }
    } catch (err) {
      console.warn('[SkyGround AudioEngine] Stop error:', err);
    }
  }
}

export const AudioEngine = new AudioEngineClass();

