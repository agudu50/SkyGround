import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { navigateTo, WebRoute } from '../navigation/WebRouter';
import { ApiClient } from '../services/apiClient';

export const WebSignupScreen: React.FC<{
  navigateTo: (r: WebRoute) => void;
  isAuthenticated: boolean;
  logout: () => void;
}> = ({ navigateTo }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen' | 'engineer' | 'nadmo'>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await ApiClient.register({
        email,
        password,
        fullName: fullName || undefined,
        role,
      });
      if (res.ok) {
        navigateTo('/dashboard');
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.backRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigateTo('/')}
            >
              <ShieldCheck size={20} color={Colors.electricCyan} />
              <Text style={styles.backText}>SkyGround</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>
            Join the early-warning network for Greater Accra
          </Text>
        </View>

        {error && (
          <View style={[styles.errorRow, { borderColor: 'rgba(248, 113, 113, 0.45)' }]}>
            <ShieldCheck size={16} color={Colors.crimsonEmergency} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full name</Text>
            <View style={styles.fieldWrap}>
              <User size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ama Mensah"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email address</Text>
            <View style={styles.fieldWrap}>
              <Mail size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.fieldWrap}>
              <Lock size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />
            </View>
            <Text style={styles.fieldHint}>
              Must be at least 6 characters
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Account role</Text>
            <View style={styles.roleWrap}>
              {[
                { value: 'citizen', label: 'Citizen' },
                { value: 'engineer', label: 'District Engineer' },
                { value: 'nadmo', label: 'NADMO Officer' },
              ].map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[
                    styles.roleChip,
                    role === r.value && styles.roleChipActive,
                  ]}
                  onPress={() => setRole(r.value as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.roleChipText, role === r.value && styles.roleChipTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#05070A" />
            ) : (
              <Text style={styles.signupButtonText}>Create account</Text>
            )}
            <ArrowRight size={18} color="#05070A" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigateTo('/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const Colors = {
  bgDark: '#05070A',
  cardSurface: '#0F172A',
  cardElevated: '#1E293B',
  electricCyan: '#22D3EE',
  crimsonEmergency: '#F87171',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.06)',
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.bgDark,
    paddingBottom: 60,
  },
  content: {
    paddingHorizontal: Platform.OS === 'web' ? 100 : 20,
    paddingVertical: 40,
    alignItems: 'center',
    minHeight: '100%',
  },
  card: {
    backgroundColor: Colors.cardSurface,
    borderRadius: 36,
    padding: Platform.OS === 'web' ? 48 : 32,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    width: Platform.OS === 'web' ? 480 : '100%',
    maxWidth: '100%',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    fontSize: 13,
    color: '#FCA5A5',
    fontWeight: '600',
    flex: 1,
  },
  form: {
    width: '100%',
  },
  field: {
    marginBottom: 18,
    width: '100%',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  roleWrap: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cardElevated,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  roleChipActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.16)',
    borderColor: Colors.electricCyan,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  roleChipTextActive: {
    color: Colors.electricCyan,
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.electricCyan,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
    width: '100%',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.bgDark,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  loginButton: {
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.electricCyan,
  },
});
