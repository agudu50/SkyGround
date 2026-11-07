import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '../theme/colors';
import { Catchment, CommunityIncident, GeminiAdvisory, LanguageCode, TelemetryReading, WeatherCondition } from '../types';
import { ACCRA_CATCHMENTS } from '../constants/catchments';
import { ApiClient } from '../services/apiClient';
import { TelemetryService } from '../services/telemetry';
import { Header } from '../components/Header';
import { HeroWeatherCard } from '../components/HeroWeatherCard';
import { DynamicThreatBanner } from '../components/DynamicThreatBanner';
import { HazardLoggerSheet } from '../components/HazardLoggerSheet';
import { HazardMap } from '../components/HazardMap';
import { MunicipalSummaryModal } from '../components/MunicipalSummaryModal';

export const HomeScreen: React.FC = () => {
  const [currentCatchment, setCurrentCatchment] = useState<Catchment>(ACCRA_CATCHMENTS[0]); // Odawna default
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('tw'); // Twi default for Accra
  const [viewMode, setViewMode] = useState<'citizen' | 'municipal'>('citizen');
  const [telemetry, setTelemetry] = useState<TelemetryReading | null>(null);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [advisory, setAdvisory] = useState<GeminiAdvisory | null>(null);
  const [incidents, setIncidents] = useState<CommunityIncident[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Initialize server connection and GPS location on startup
  useEffect(() => {
    const initApp = async () => {
      // 1. Check server & PostGIS status
      const isServerUp = await ApiClient.checkServerHealth();
      setIsOnline(isServerUp);

      // 2. Request GPS location
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const matched = await ApiClient.getCurrentCatchment(loc.coords.latitude, loc.coords.longitude);
          setCurrentCatchment(matched);
        }
      } catch (e) {
        console.warn('[SkyGround Client] GPS location fetch bypassed, using Accra default:', e);
      }

      await loadCatchmentData(currentCatchment);
    };

    initApp();
  }, []);

  const loadCatchmentData = async (catchment: Catchment) => {
    try {
      // Fetch telemetry & calculate DRII
      const telem = await ApiClient.getTelemetry(catchment);
      setTelemetry(telem);

      // Everyday weather condition
      const w = await TelemetryService.getDailyWeather(catchment);
      setWeather(w);

      // Fetch nearby PostGIS community incidents
      const incList = await ApiClient.getNearbyIncidents(
        catchment.center.latitude,
        catchment.center.longitude,
        5000
      );
      setIncidents(incList);

      // Synthesize Gemini Reasoning advisory
      const adv = await ApiClient.getAdvisory(catchment, telem, incList.length);
      setAdvisory(adv);
    } catch (err) {
      console.warn('[SkyGround Client] Error loading catchment data:', err);
    }
  };

  const handleSelectCatchment = async (c: Catchment) => {
    setCurrentCatchment(c);
    await loadCatchmentData(c);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCatchmentData(currentCatchment);
    setIsRefreshing(false);
  };

  const handleIncidentReported = (newIncident: CommunityIncident) => {
    setIncidents((prev) => [newIncident, ...prev]);
  };

  const handleUpvoteIncident = async (id: string) => {
    const newCount = await ApiClient.upvoteIncident(id);
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              upvotes: newCount,
              verification_status: newCount >= 3 ? 'COMMUNITY_VERIFIED' : i.verification_status,
            }
          : i
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* App Header & Catchment Switcher */}
        <Header
          currentCatchment={currentCatchment}
          onSelectCatchment={handleSelectCatchment}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
          isOnline={isOnline}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
        />

        {viewMode === 'municipal' ? (
          /* Municipal Operations View (NADMO & District Engineer Command) */
          <MunicipalSummaryModal
            currentCatchment={currentCatchment}
            incidents={incidents}
            advisory={advisory}
            onClose={() => setViewMode('citizen')}
          />
        ) : (
          /* Citizen View: Everyday Weather + High-Contrast Storm Alert Surface */
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.electricCyan}
                colors={[Colors.electricCyan]}
              />
            }
          >
            {/* Dynamic Convective Early Warning Banner */}
            <DynamicThreatBanner
              catchment={currentCatchment}
              threatLevel={currentCatchment.current_threat_level}
              advisory={advisory}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
            />

            {/* Everyday Weather Hero Card with Soil Saturation Radial Gauge */}
            {weather && (
              <HeroWeatherCard
                catchment={currentCatchment}
                weather={weather}
              />
            )}

            {/* 1-Tap Hazard Logger (Bottom Grid with 4 Tactile Buttons) */}
            <HazardLoggerSheet
              currentCatchment={currentCatchment}
              onIncidentReported={handleIncidentReported}
            />

            {/* In-App Interactive Spatial Hazard & Catchment Map */}
            <HazardMap
              currentCatchment={currentCatchment}
              onSelectCatchment={handleSelectCatchment}
              incidents={incidents}
              onUpvoteIncident={handleUpvoteIncident}
            />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
});
