import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { Colors } from './src/theme/colors';

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
});
