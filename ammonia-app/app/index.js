import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Platform, ScrollView
} from 'react-native';
import { predictAmmoniaRisk } from '../src/ammonia_engine';

// ── Color tokens (matching original #2c3e50 dark theme) ────────────────────
const C = {
  bg:        '#1a1f2e',
  card:      '#222a3a',
  cardBorder:'#2e3a4e',
  input:     '#1e2536',
  inputBorder:'#3a4a5e',
  text:      '#ecf0f1',
  textDim:   '#7f8c8d',
  accent:    '#3498db',
  safe:      '#2ecc71',
  warning:   '#f1c40f',
  critical:  '#e74c3c',
  criticalBg:'rgba(231,76,60,0.12)',
  warningBg: 'rgba(241,196,15,0.12)',
  safeBg:    'rgba(46,204,113,0.12)',
};

// ── Pulse animation hook ────────────────────────────────────────────────────
function usePulse(active) {
  const scale = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    if (!active) { Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.06, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0,  duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, scale]);
  return scale;
}

// ── Gauge bar component ─────────────────────────────────────────────────────
function GaugeBar({ value, maxValue = 0.5 }) {
  const pct = Math.min(value / maxValue, 1);
  // color transitions: 0–0.1 green, 0.1–0.68 yellow, 0.68–1 red
  let barColor = C.safe;
  if (pct > 0.68) barColor = C.critical;
  else if (pct > 0.1) barColor = C.warning;

  return (
    <View style={S.gaugeTrack}>
      <Animated.View style={[S.gaugeFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
      {/* threshold markers */}
      <View style={[S.marker, { left: '10%' }]}><Text style={S.markerLabel}>0.05</Text></View>
      <View style={[S.marker, { left: '68%' }]}><Text style={S.markerLabel}>0.34</Text></View>
    </View>
  );
}

// ── Input row ────────────────────────────────────────────────────────────────
function InputRow({ label, unit, value, onChangeText, placeholder, hint }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={S.inputGroup}>
      <View style={S.inputLabelRow}>
        <Text style={S.inputLabel}>{label}</Text>
        <Text style={S.inputUnit}>{unit}</Text>
      </View>
      {hint && <Text style={S.inputHint}>{hint}</Text>}
      <TextInput
        style={[S.input, focused && S.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textDim}
        keyboardType="decimal-pad"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        spellCheck={false}
      />
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [temp,  setTemp ]  = useState('');
  const [pH,    setpH   ]  = useState('');
  const [ec,    setEc   ]  = useState('');
  const [result, setResult] = useState(null);
  const [error,  setError ] = useState('');
  const pulse = usePulse(result !== null);

  const validate = useCallback(() => {
    const t = parseFloat(temp), p = parseFloat(pH), e = parseFloat(ec);
    if (isNaN(t) || isNaN(p) || isNaN(e)) { setError('Please enter valid numbers in all fields.'); return null; }
    if (t < 5  || t > 40)  { setError('Temperature should be between 5–40 °C.'); return null; }
    if (p < 5  || p > 10)  { setError('pH should be between 5.0–10.0.'); return null; }
    if (e < 50 || e > 3000){ setError('EC should be between 50–3000 µS/cm.'); return null; }
    setError('');
    return { t, p, e };
  }, [temp, pH, ec]);

  const handlePredict = useCallback(() => {
    const v = validate();
    if (!v) return;
    setResult(predictAmmoniaRisk(v.t, v.p, v.e));
  }, [validate]);

  const riskColor  = result ? (result.risk === 'SAFE' ? C.safe : result.risk === 'WARNING' ? C.warning : C.critical) : C.textDim;
  const riskBg     = result ? (result.risk === 'SAFE' ? C.safeBg : result.risk === 'WARNING' ? C.warningBg : C.criticalBg) : 'transparent';
  const advice     = result
    ? result.risk === 'SAFE'     ? 'Conditions are optimal. Continue normal feeding.'
    : result.risk === 'WARNING'  ? 'STOP FEEDING immediately. Monitor water closely.'
    :                               'MORTALITY RISK! Perform emergency water exchange now.'
    : '';

  return (
    <ScrollView style={S.root} contentContainerStyle={S.scroll} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={S.header}>
        <Text style={S.headerIcon}>🛡️</Text>
        <Text style={S.headerTitle}>AMMONIA SAFETY GUARD</Text>
        <Text style={S.headerSub}>Offline Soft-Sensor v1.0</Text>
      </View>

      {/* Inputs Card */}
      <View style={S.card}>
        <Text style={S.cardTitle}>Water Parameters</Text>
        <InputRow label="Temperature"            unit="°C"      value={temp}  onChangeText={setTemp}  placeholder="e.g. 28"    hint="Pond / tank water temperature" />
        <InputRow label="pH Level"               unit="—"       value={pH}    onChangeText={setpH}    placeholder="e.g. 7.5"   hint="Surface water pH reading" />
        <InputRow label="Electrical Conductivity" unit="µS/cm"  value={ec}    onChangeText={setEc}    placeholder="e.g. 1200"  hint="Total dissolved solids proxy" />
      </View>

      {/* Error */}
      {!!error && (
        <View style={S.errorBox}>
          <Text style={S.errorText}>⚠️  {error}</Text>
        </View>
      )}

      {/* Analyze Button */}
      <TouchableOpacity style={S.btn} onPress={handlePredict} activeOpacity={0.75}>
        <Text style={S.btnText}>ANALYZE RISK</Text>
      </TouchableOpacity>

      {/* Results Card */}
      <Animated.View style={[S.card, { transform: [{ scale: pulse }] }]}>
        <Text style={S.cardTitle}>Prediction Results</Text>

        {/* Status badge */}
        <View style={[S.statusBadge, { backgroundColor: riskBg, borderColor: riskColor }]}>
          <Text style={[S.statusText, { color: riskColor }]}>
            {result ? (result.risk === 'SAFE' ? '✔  ' : result.risk === 'WARNING' ? '⚡ ' : '🚨 ') : ''}
            {result ? result.risk : 'WAITING…'}
          </Text>
        </View>

        {/* Gauge */}
        <View style={S.gaugeSection}>
          <Text style={S.gaugeLabelLeft}>Safe</Text>
          <GaugeBar value={result ? result.toxicNH3 : 0} />
          <Text style={S.gaugeLabelRight}>Critical</Text>
        </View>

        {/* Numbers */}
        <View style={S.metricsRow}>
          <View style={S.metricBox}>
            <Text style={S.metricLabel}>Total Ammonia (TAN)</Text>
            <Text style={[S.metricValue, { color: C.accent }]}>
              {result ? result.TAN.toFixed(4) : '—'}
            </Text>
            <Text style={S.metricUnit}>mg/L</Text>
          </View>
          <View style={[S.metricBox, S.metricDivider]}>
            <Text style={S.metricLabel}>Toxic NH₃</Text>
            <Text style={[S.metricValue, { color: riskColor }]}>
              {result ? result.toxicNH3.toFixed(5) : '—'}
            </Text>
            <Text style={S.metricUnit}>mg/L</Text>
          </View>
        </View>

        {/* Advice */}
        {!!advice && (
          <View style={[S.adviceBox, { borderColor: riskColor, backgroundColor: riskBg }]}>
            <Text style={[S.adviceText, { color: riskColor }]}>{advice}</Text>
          </View>
        )}
      </Animated.View>

      {/* Footer note */}
      <Text style={S.footer}>
        Emerson NH₃ equilibrium model · Runs fully offline · No data is transmitted
      </Text>
    </ScrollView>
  );
}

// ── StyleSheet ───────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  scroll:{ paddingHorizontal: 18, paddingBottom: 40, paddingTop: Platform.OS === 'ios' ? 60 : 40 },

  // Header
  header:    { alignItems: 'center', marginBottom: 24 },
  headerIcon:{ fontSize: 28, marginBottom: 2 },
  headerTitle:{ color: C.text, fontSize: 20, fontWeight: '700', letterSpacing: 2, fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto' },
  headerSub: { color: C.textDim, fontSize: 12, marginTop: 2 },

  // Card
  card:      { backgroundColor: C.card, borderRadius: 14, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: C.cardBorder },
  cardTitle: { color: C.textDim, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 },

  // Inputs
  inputGroup:    { marginBottom: 14 },
  inputLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  inputLabel:    { color: C.text, fontSize: 14, fontWeight: '500' },
  inputUnit:     { color: C.accent, fontSize: 13, fontWeight: '600' },
  inputHint:     { color: C.textDim, fontSize: 11, marginBottom: 4 },
  input: {
    backgroundColor: C.input, borderWidth: 1, borderColor: C.inputBorder,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
    color: C.text, fontSize: 16, fontWeight: '500',
  },
  inputFocused: { borderColor: C.accent },

  // Button
  btn: {
    backgroundColor: C.accent, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginBottom: 18,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10,
    elevation: 6,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 1.5 },

  // Error
  errorBox:  { backgroundColor: 'rgba(231,76,60,0.1)', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)' },
  errorText: { color: C.critical, fontSize: 13 },

  // Status badge
  statusBadge: { alignItems: 'center', borderRadius: 10, paddingVertical: 10, marginBottom: 16, borderWidth: 1.5 },
  statusText:  { fontSize: 22, fontWeight: '800', letterSpacing: 2 },

  // Gauge
  gaugeSection:   { marginBottom: 12 },
  gaugeTrack:     { height: 12, backgroundColor: '#2e3a4e', borderRadius: 6, position: 'relative', overflow: 'visible', marginHorizontal: 4 },
  gaugeFill:      { height: '100%', borderRadius: 6, transition: 'width 0.3s' },
  marker:         { position: 'absolute', top: 14, alignItems: 'center' },
  markerLabel:    { color: C.textDim, fontSize: 9, marginTop: 2 },
  gaugeLabelLeft: { color: C.safe, fontSize: 10, fontWeight: '600', marginBottom: 4 },
  gaugeLabelRight:{ color: C.critical, fontSize: 10, fontWeight: '600', textAlign: 'right', marginTop: 18 },

  // Metrics
  metricsRow:    { flexDirection: 'row', marginBottom: 14 },
  metricBox:     { flex: 1, alignItems: 'center' },
  metricDivider: { borderLeftWidth: 1, borderLeftColor: C.cardBorder },
  metricLabel:   { color: C.textDim, fontSize: 11, marginBottom: 4 },
  metricValue:   { fontSize: 22, fontWeight: '700' },
  metricUnit:    { color: C.textDim, fontSize: 11, marginTop: 2 },

  // Advice
  adviceBox:  { borderRadius: 8, padding: 12, borderWidth: 1 },
  adviceText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },

  // Footer
  footer: { color: C.textDim, fontSize: 10, textAlign: 'center', marginTop: 8, lineHeight: 16 },
});
