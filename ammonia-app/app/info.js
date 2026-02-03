import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';

const C = {
  bg:'#1a1f2e', card:'#222a3a', cardBorder:'#2e3a4e',
  text:'#ecf0f1', textDim:'#7f8c8d', accent:'#3498db',
  safe:'#2ecc71', warning:'#f1c40f', critical:'#e74c3c',
};

function Section({ title, children }) {
  return (
    <View style={S.card}>
      <Text style={S.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value, color }) {
  return (
    <View style={S.row}>
      <Text style={S.rowLabel}>{label}</Text>
      <Text style={[S.rowValue, color && { color }]}>{value}</Text>
    </View>
  );
}

function Para({ children }) {
  return <Text style={S.para}>{children}</Text>;
}

export default function InfoScreen() {
  return (
    <ScrollView style={S.root} contentContainerStyle={S.scroll}>
      {/* Header */}
      <View style={S.header}>
        <Text style={S.headerIcon}>📘</Text>
        <Text style={S.headerTitle}>HOW IT WORKS</Text>
      </View>

      {/* Physics model */}
      <Section title="Emerson NH₃ Equilibrium Model">
        <Para>
          The core science is the Emerson equation — the industry-standard method for calculating
          unionized (toxic) ammonia from Total Ammonia Nitrogen (TAN), water temperature, and pH.
        </Para>
        <Para style={{ marginTop: 8 }}>
          {'NH₃(toxic) = TAN × [ 1 / (1 + 10^(pKa − pH)) ]'}
        </Para>
        <Para style={{ marginTop: 4 }}>
          {'where  pKa = 0.09018 + (2729.92 / T_kelvin)'}
        </Para>
        <Para style={{ marginTop: 8 }}>
          As temperature rises or pH increases, a larger fraction of TAN becomes the toxic
          unionized form (NH₃). This is why the same TAN reading can be harmless in cold,
          acidic water but deadly in warm, alkaline water.
        </Para>
      </Section>

      {/* Risk thresholds */}
      <Section title="Risk Thresholds">
        <Para>
          These thresholds are based on commonly referenced aquaculture toxicity guidelines:
        </Para>
        <View style={{ marginTop: 10 }}>
          <Row label="SAFE"     value="< 0.05 mg/L"  color={C.safe} />
          <Para style={S.threshDesc}>No acute stress expected. Normal feeding can continue.</Para>
          <Row label="WARNING"  value="0.05 – 0.34 mg/L" color={C.warning} />
          <Para style={S.threshDesc}>Sub-lethal stress. Stop feeding. Increase aeration. Monitor.</Para>
          <Row label="CRITICAL" value="≥ 0.34 mg/L"  color={C.critical} />
          <Para style={S.threshDesc}>Acute toxicity zone. Emergency water exchange required immediately.</Para>
        </View>
      </Section>

      {/* TAN estimation */}
      <Section title="TAN Estimation (Soft Sensor)">
        <Para>
          Total Ammonia (TAN) is not directly measured by this app — it is estimated using
          a gradient-boosted regression model trained on aquaculture water quality data.
        </Para>
        <Para style={{ marginTop: 6 }}>
          The model takes Temperature, pH, and Electrical Conductivity (EC) as inputs and
          predicts TAN via learned relationships between these parameters. EC is used as a
          proxy for organic load and dissolved solids, both of which correlate with ammonia
          production in fish ponds and tanks.
        </Para>
        <Para style={{ marginTop: 6 }}>
          Feature engineering: pH×Temp and EC×pH interaction terms are computed before
          prediction, matching the training pipeline exactly.
        </Para>
      </Section>

      {/* Offline note */}
      <Section title="Privacy & Offline Mode">
        <Para>
          🔒  This app runs entirely offline. The ML model and all physics calculations
          are bundled directly in the app. No data — inputs or outputs — is ever sent
          to any server. Your water quality readings remain completely private.
        </Para>
      </Section>

      {/* Input ranges */}
      <Section title="Valid Input Ranges">
        <Row label="Temperature" value="5 – 40 °C" />
        <Row label="pH"          value="5.0 – 10.0" />
        <Row label="EC"          value="50 – 3000 µS/cm" />
      </Section>

      {/* Disclaimer */}
      <Section title="Disclaimer">
        <Para>
          This is a decision-support tool for educational and screening purposes.
          For critical aquaculture management decisions, always verify readings with
          laboratory-grade ammonia test kits. Consult a qualified aquaculturist for
          emergency response protocols.
        </Para>
      </Section>
    </ScrollView>
  );
}

const S = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  scroll:{ paddingHorizontal: 18, paddingBottom: 40, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header:    { alignItems: 'center', marginBottom: 22 },
  headerIcon:{ fontSize: 26, marginBottom: 2 },
  headerTitle:{ color: C.text, fontSize: 18, fontWeight: '700', letterSpacing: 2 },
  card:      { backgroundColor: C.card, borderRadius: 14, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: C.cardBorder },
  cardTitle: { color: C.textDim, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  para:      { color: C.text, fontSize: 14, lineHeight: 21 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.cardBorder },
  rowLabel:  { color: C.text, fontSize: 14, fontWeight: '600' },
  rowValue:  { color: C.textDim, fontSize: 14, fontWeight: '500' },
  threshDesc:{ color: C.textDim, fontSize: 12, paddingVertical: 4, paddingLeft: 8 },
});
