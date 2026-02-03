import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import HomeScreen from './index';
import InfoScreen from './info';

const C = { bg:'#1a1f2e', card:'#222a3a', accent:'#3498db', textDim:'#7f8c8d' };

export default function TabLayout() {
  const [tab, setTab] = React.useState('home');
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {tab === 'home' ? <HomeScreen /> : <InfoScreen />}
      {/* Bottom tab bar */}
      <View style={S.tabBar}>
        {[
          { key: 'home', icon: '🛡️', label: 'Sensor' },
          { key: 'info', icon: '📘', label: 'Info'   },
        ].map(t => {
          const active = tab === t.key;
          return (
            <TouchableOpacity key={t.key} style={S.tabBtn} onPress={() => setTab(t.key)}>
              <Text style={[S.tabIcon, { opacity: active ? 1 : 0.45 }]}>{t.icon}</Text>
              <Text style={[S.tabLabel, { color: active ? C.accent : C.textDim }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: '#2e3a4e',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    height: Platform.OS === 'ios' ? 82 : 60,
  },
  tabBtn:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 22 },
  tabLabel:{ fontSize: 11, fontWeight: '600', marginTop: 2 },
});
