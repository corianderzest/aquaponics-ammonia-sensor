import React from 'react';
import { View, StatusBar } from 'react-native';
import TabLayout from './app/_layout';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#1a1f2e' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1f2e" />
      <TabLayout />
    </View>
  );
}
