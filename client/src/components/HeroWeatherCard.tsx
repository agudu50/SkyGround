import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, UI } from '../theme/colors';
import { Catchment, WeatherCondition } from '../types';
import { CloudRain, Sun, CloudLightning, Wind, Droplets, AlertTriangle } from 'lucide-react-native';

interface HeroWeatherCardProps {
  catchment: Catchment;
  weather: WeatherCondition;
}

export const HeroWeatherCard: React.FC<HeroWeatherCardProps> = ({
  catchment,
  weather,
}) => {
  const saturation = catchment.soil_saturation_pct;
  const isHighSaturation = saturation >= 75;
  const isCriticalSaturation = saturation >= 85;

  // Circular gauge calculations
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * saturation) / 100;

  const saturationColor = isCriticalSaturation
    ? Colors.crimsonEmergency
    : isHighSaturation
    ? Colors.amberWarning
    : Colors.electricCyan;

  const renderConditionIcon = () => {
    switch (weather.condition_code) {
      case 'monsoon':
      case 'thunderstorm':
        return <CloudLightning size={40} color={Colors.amberWarning} />;
      case 'showers':
        return <CloudRain size={40} color={Colors.electricCyan} />;
      default:
        return <Sun size={40} color="#FBBF24" />;
    }
  };

  return (
    <View style={styles.cardWrap}>
      <BlurView style={styles.cardBlur} intensity={20}>
        <View style={styles.cardContent}>
          <View style={styles.topRow}>
            <View style={styles.tempSection}>
              <View style={styles.iconTempRow}>
                {renderConditionIcon()}
                <Text style={styles.tempText}>{weather.temp_c}°</Text>
              </View>
              <Text style={styles.conditionText}>{weather.condition}</Text>
              <Text style={styles.feelsLikeText}>
                Feels like {weather.feels_like_c}°C • Humidity {weather.humidity_pct}%
              </Text>
            </View>

            {/* High-Impact Radial Soil Saturation Gauge */}
            <View style={styles.gaugeContainer}>
              <Svg width={size} height={size} style={styles.svgGauge}>
                <Defs>
                  <LinearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={saturationColor} stopOpacity={1} />
                    <Stop offset="100%" stopColor={isCriticalSaturation ? '#B91C1C' : '#0891B2'} stopOpacity={0.85} />
                  </LinearGradient>
                </Defs>
                {/* Background Track */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {/* Progress Arc */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="url(#gaugeGrad)"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${size / 2}, ${size / 2}`}
                />
              </Svg>

              <View style={styles.gaugeTextWrap}>
                <Text style={[styles.gaugeValue, { color: saturationColor }]}>
                  {saturation}%
                </Text>
                <Text style={styles.gaugeLabel}>Soil Saturation</Text>
              </View>
            </View>
          </View>

          {/* Soil Waterlog Alert Banner if Saturation > 85% */}
          {isCriticalSaturation && (
            <View style={[styles.waterlogNotice, { borderColor: 'rgba(248, 113, 113, 0.45)' }]}>
              <AlertTriangle size={15} color={Colors.crimsonEmergency} />
              <Text style={styles.waterlogNoticeText}>
                Waterlogged Ground: Soil at {saturation}% capacity. Zero rain infiltration capacity.
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Hourly Rain Timeline Forecast */}
          <View style={styles.timelineSection}>
            <View style={styles.timelineHeader}>
              <Text style={styles.timelineTitle}>Convective Rain Inundation Timeline</Text>
              <Text style={styles.timelineAccum}>24h Accum: {catchment.accum_24h_mm} mm</Text>
            </View>

            <View style={styles.timelineBars}>
              {weather.hourly_rain.map((item, idx) => {
                const barHeight = Math.min(64, Math.max(8, item.rain_mm * 1.8));
                const isHeavy = item.rain_mm > 15;
                return (
                  <View key={idx} style={styles.timelineColumn}>
                    <Text style={styles.timelineRainVal}>
                      {item.rain_mm > 0 ? `${item.rain_mm}m` : '-'}
                    </Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: barHeight,
                            backgroundColor: isHeavy
                              ? Colors.crimsonEmergency
                              : item.rain_mm > 8
                              ? Colors.amberWarning
                              : Colors.electricCyan,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.timelineHour}>{item.hour}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Secondary Metrics Footer */}
          <View style={styles.footerMetrics}>
            <View style={styles.footerMetricItem}>
              <CloudRain size={15} color={Colors.electricCyan} />
              <View>
                <Text style={styles.footerMetricLabel}>Rain Rate</Text>
                <Text style={styles.footerMetricVal}>{catchment.rain_rate_mmh} mm/h</Text>
              </View>
            </View>
            <View style={styles.footerMetricItem}>
              <Wind size={15} color={Colors.textMuted} />
              <View>
                <Text style={styles.footerMetricLabel}>Wind</Text>
                <Text style={styles.footerMetricVal}>{weather.wind_kph} km/h</Text>
              </View>
            </View>
            <View style={styles.footerMetricItem}>
              <Droplets size={15} color={Colors.waterlogBlue} />
              <View>
                <Text style={styles.footerMetricLabel}>Base Elevation</Text>
                <Text style={styles.footerMetricVal}>{catchment.base_elevation_m}m AMSL</Text>
              </View>
            </View>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrap: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  cardBlur: {
    borderRadius: UI.borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: 'hidden',
    ...UI.shadow.lg,
  },
  cardContent: {
    padding: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempSection: {
    flex: 1,
  },
  iconTempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tempText: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -2,
  },
  conditionText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  feelsLikeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  gaugeContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svgGauge: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gaugeTextWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  gaugeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  waterlogNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderWidth: 1,
    borderRadius: UI.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
  },
  waterlogNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FCA5A5',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 16,
  },
  timelineSection: {},
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  timelineAccum: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.electricCyan,
  },
  timelineBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 88,
    paddingVertical: 6,
  },
  timelineColumn: {
    alignItems: 'center',
    flex: 1,
  },
  timelineRainVal: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 5,
  },
  barTrack: {
    width: 16,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  timelineHour: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 7,
  },
  footerMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  footerMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerMetricLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  footerMetricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
});
