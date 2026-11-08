import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { ShieldAlert, ArrowLeft, UserPlus } from 'lucide-react-native';
import { ApiClient } from '../services/apiClient';
import { WebRoute } from '../navigation/WebRouter';

interface WebScreenProps {
  navigateTo: (route: WebRoute) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

export const WebSignupScreen: React.FC<WebScreenProps> = ({ navigateTo }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'citizen' | 'engineer' | 'nadmo'>('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
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
    } catch (err: any) {
      setError(err?.message || 'Registration request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigateTo('/')}>
        <ArrowLeft size={16} color={Colors.electricCyan} />
        <Text style={styles.backBtnText}>Back to Home</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.header}>
          <ShieldAlert size={36} color={Colors.electricCyan} />
          <Text style={styles.title}>Create SkyGround Account</Text>
          <Text style={styles.subtitle}>
            Join Accra's Community Early Flood Warning Grid
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Kofi Mensah"
            placeholderTextColor="#64748B"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="kofi@accra.gov.gh"
            placeholderTextColor="#64748B"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 6 characters"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            {(['citizen', 'engineer', 'nadmo'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleChip, role === r && styles.roleChipActive]}
                onPress={() => setRole(r)}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    role === r && styles.roleChipTextActive,
                  ]}
                >
                  {r.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <UserPlus size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>Create Account</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigateTo('/login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backBtn: {
    position: 'absolute',
    top: 28,
    left: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    color: Colors.electricCyan,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Colors.cardSurface,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderColor: 'rgba(248, 113, 113, 0.4)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.crimsonEmergency,
    fontSize: 13,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.cardElevated,
  },
  roleChipActive: {
    borderColor: Colors.electricCyan,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  roleChipTextActive: {
    color: Colors.electricCyan,
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  linkText: {
    color: Colors.electricCyan,
    fontWeight: '600',
    fontSize: 13,
  },
});
