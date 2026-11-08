import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors, UI } from '../theme/colors';
import { Catchment, CommunityIncident, ThreatLevel } from '../types';
import { ACCRA_CATCHMENTS } from '../constants/catchments';
import { Layers, ShieldCheck, AlertCircle, Droplet, Navigation2 } from 'lucide-react-native';

let NativeMapView: any = null;
let NativePolygon: any = null;
let NativeMarker: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    NativeMapView = Maps.default;
    NativePolygon = Maps.Polygon;
    NativeMarker = Maps.Marker;
  } catch (e) {}
}

interface HazardMapProps {
  currentCatchment: Catchment;
  onSelectCatchment: (c: Catchment) => void;
  incidents: CommunityIncident[];
  onUpvoteIncident: (id: string) => void;
}

export const HazardMap: React.FC<HazardMapProps> = ({
  currentCatchment,
  onSelectCatchment,
  incidents,
  onUpvoteIncident,
}) => {
  const [selectedIncident, setSelectedIncident] = useState<CommunityIncident | null>(null);
  const [showWaterlogLayer, setShowWaterlogLayer] = useState(true);

  const getThreatFillColor = (threat: ThreatLevel, isWaterlogged: boolean) => {
    if (isWaterlogged && showWaterlogLayer) {
      return 'rgba(96, 165, 250, 0.40)';
    }
    switch (threat) {
      case 'CRITICAL':
        return 'rgba(248, 113, 113, 0.35)';
      case 'AMBER':
        return 'rgba(251, 191, 36, 0.30)';
      case 'LOW':
      default:
        return 'rgba(52, 211, 153, 0.25)';
    }
  };

  const getThreatStrokeColor = (threat: ThreatLevel, isWaterlogged: boolean) => {
    if (isWaterlogged && showWaterlogLayer) {
      return Colors.waterlogBlue;
    }
    return Colors.threat[threat].primary;
  };

  const handleIncidentPress = (inc: CommunityIncident) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    setSelectedIncident(inc);
  };

  const initialRegion = {
    latitude: currentCatchment.center.latitude,
    longitude: currentCatchment.center.longitude,
    latitudeDelta: 0.055,
    longitudeDelta: 0.055,
  };

  return (
    <View style={[styles.cardWrap, UI.shadow.lg]}>
      <BlurView style={styles.cardBlur} intensity={18}>
        <View style={styles.cardContent}>
          {/* Map Header with Filters */}
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Layers size={17} color={Colors.electricCyan} />
              <Text style={styles.title}>Greater Accra Spatial Drainage Grid</Text>
            </View>

            <TouchableOpacity
              style={[styles.layerToggle, showWaterlogLayer && styles.layerToggleActive]}
              onPress={() => {
                try { Haptics.selectionAsync(); } catch (e) {}
                setShowWaterlogLayer(!showWaterlogLayer);
              }}
            >
              <Droplet size={13} color={showWaterlogLayer ? Colors.bgDark : Colors.waterlogBlue} />
              <Text style={[styles.layerToggleText, showWaterlogLayer && styles.layerToggleTextActive]}>
                Waterlog Layer
              </Text>
            </TouchableOpacity>
          </View>

          {/* Map Surface */}
          <View style={styles.mapFrame}>
            {NativeMapView ? (
              <NativeMapView
                style={styles.map}
                initialRegion={initialRegion}
                region={{
                  latitude: currentCatchment.center.latitude,
                  longitude: currentCatchment.center.longitude,
                  latitudeDelta: 0.045,
                  longitudeDelta: 0.045,
                }}
                userInterfaceStyle="dark"
              >
                {/* Catchment Polygons */}
                {ACCRA_CATCHMENTS.map((c) => {
                  const coords = c.boundary.coordinates[0].map(([lon, lat]) => ({
                    latitude: lat,
                    longitude: lon,
                  }));
                  const isSelected = c.id === currentCatchment.id;
                  return (
                    <NativePolygon
                      key={c.id}
                      coordinates={coords}
                      fillColor={getThreatFillColor(c.current_threat_level, c.is_waterlog_prone && c.soil_saturation_pct > 85)}
                      strokeColor={getThreatStrokeColor(c.current_threat_level, c.is_waterlog_prone && c.soil_saturation_pct > 85)}
                      strokeWidth={isSelected ? 3 : 1.5}
                      tappable
                      onPress={() => onSelectCatchment(c)}
                    />
                  );
                })}

                {/* Incident Markers */}
                {incidents.map((inc) => (
                  <NativeMarker
                    key={inc.id}
                    coordinate={{ latitude: inc.latitude, longitude: inc.longitude }}
                    onPress={() => handleIncidentPress(inc)}
                  >
                    <View style={[styles.customPin, { backgroundColor: Colors.hazards[inc.hazard_type] }]}>
                      <AlertCircle size={15} color="#FFF" />
                    </View>
                  </NativeMarker>
                ))}
              </NativeMapView>
            ) : (
              /* High-Fidelity Spatial Fallback / Web View */
              <View style={styles.fallbackMap}>
                <View style={styles.gridLinesOverlay} />

                {/* Catchment Cards / Geospatial Representation */}
                {ACCRA_CATCHMENTS.map((c) => {
                  const isSelected = c.id === currentCatchment.id;
                  const color = Colors.threat[c.current_threat_level].primary;
                  const isWaterlogged = c.is_waterlog_prone && c.soil_saturation_pct > 85;

                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.spatialNode,
                        {
                          borderColor: isWaterlogged ? Colors.waterlogBlue : color,
                          backgroundColor: isWaterlogged
                            ? 'rgba(96, 165, 250, 0.25)'
                            : Colors.threat[c.current_threat_level].bg,
                        },
                        isSelected && styles.spatialNodeSelected,
                      ]}
                      onPress={() => {
                        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}
                        onSelectCatchment(c);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.nodeHeader}>
                        <View style={[styles.nodeDot, { backgroundColor: color }]} />
                        <Text style={styles.nodeTitle} numberOfLines={1}>
                          {c.name}
                        </Text>
                      </View>
                      <Text style={styles.nodeElev}>Elev: {c.base_elevation_m}m • Sat: {c.soil_saturation_pct}%</Text>
                      {isWaterlogged && (
                        <View style={styles.waterlogBadge}>
                          <Droplet size={11} color="#FFF" />
                          <Text style={styles.waterlogBadgeText}>WATERLOGGED</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}

                {/* Active Incident Counter Float */}
                <View style={styles.mapFloatingBadge}>
                  <Navigation2 size={13} color={Colors.electricCyan} />
                  <Text style={styles.mapFloatingText}>
                    {incidents.length} Verified Field Reports Active
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Incident Detail Drawer (when user taps an incident) */}
          {selectedIncident && (
            <View style={[styles.incidentDrawer, UI.shadow.md]}>
              <View style={styles.drawerTop}>
                <View style={styles.drawerHazardTag}>
                  <View
                    style={[
                      styles.drawerDot,
                      { backgroundColor: Colors.hazards[selectedIncident.hazard_type] },
                    ]}
                  />
                  <Text style={styles.drawerHazardText}>
                    {selectedIncident.hazard_type.replace('_', ' ')}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedIncident(null)}
                  style={styles.drawerClose}
                >
                  <Text style={styles.drawerCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.drawerNeighborhood}>{selectedIncident.neighborhood_name}</Text>
              <Text style={styles.drawerDesc}>{selectedIncident.description}</Text>

              <View style={styles.drawerFooter}>
                <View style={styles.verifiedRow}>
                  <ShieldCheck size={15} color={Colors.emeraldSuccess} />
                  <Text style={styles.verifiedText}>
                    {selectedIncident.verification_status} ({selectedIncident.upvotes} confirms)
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.upvoteButton}
                  onPress={() => {
                    onUpvoteIncident(selectedIncident.id);
                    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e) {}
                  }}
                >
                  <Text style={styles.upvoteButtonText}>+ Confirm Hazard</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Catchment Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.threat.CRITICAL.primary }]} />
              <Text style={styles.legendText}>Critical</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.threat.AMBER.primary }]} />
              <Text style={styles.legendText}>Amber Watch</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.threat.LOW.primary }]} />
              <Text style={styles.legendText}>Safe</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.waterlogBlue }]} />
              <Text style={styles.legendText}>Waterlogged Zone</Text>
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
    borderRadius: UI.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  cardBlur: {
    borderRadius: UI.borderRadius.xl,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  layerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.waterlogBlue,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
  },
  layerToggleActive: {
    backgroundColor: Colors.waterlogBlue,
  },
  layerToggleText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.waterlogBlue,
  },
  layerToggleTextActive: {
    color: Colors.bgDark,
  },
  mapFrame: {
    height: 240,
    borderRadius: UI.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: '#020407',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  fallbackMap: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    position: 'relative',
  },
  gridLinesOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.05,
    backgroundColor: '#22D3EE',
  },
  spatialNode: {
    borderRadius: UI.borderRadius.md,
    padding: 10,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  spatialNodeSelected: {
    borderWidth: 2,
    shadowColor: Colors.electricCyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nodeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  nodeElev: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  waterlogBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.waterlogBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  waterlogBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
  },
  mapFloatingBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(2, 4, 8, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    ...UI.shadow.sm,
  },
  mapFloatingText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  customPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  incidentDrawer: {
    backgroundColor: Colors.cardElevated,
    borderRadius: UI.borderRadius.md,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  drawerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerHazardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  drawerHazardText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  drawerClose: {
    padding: 6,
  },
  drawerCloseText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  drawerNeighborhood: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 6,
  },
  drawerDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  drawerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    fontSize: 11,
    color: Colors.emeraldSuccess,
    fontWeight: '700',
  },
  upvoteButton: {
    backgroundColor: Colors.cardHighlight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: UI.borderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  upvoteButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.electricCyan,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
