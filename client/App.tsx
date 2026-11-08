import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { WebRouter } from './src/navigation/WebRouter';
import { Colors } from './src/theme/colors';

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {Platform.OS === 'web' ? <WebRouter /> : <HomeScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
});
