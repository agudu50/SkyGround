import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { ShieldAlert, LogOut, ArrowLeft, User } from 'lucide-react-native';
import { HomeScreen } from './HomeScreen';
import { ApiClient } from '../services/apiClient';
import { WebRoute } from '../navigation/WebRouter';

interface WebScreenProps {
  navigateTo: (route: WebRoute) => void;
  isAuthenticated: boolean;
  logout: () => void;
}

export const WebDashboardScreen: React.FC<WebScreenProps> = ({
  navigateTo,
  isAuthenticated,
  logout,
}) => {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    fullName?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      ApiClient.me().then((res) => {
        if (res.ok && res.user) {
          setCurrentUser(res.user);
        }
      });
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await ApiClient.logout();
    logout();
    navigateTo('/');
  };

  return (
    <View style={styles.container}>
      {/* Top Bar for Web Dashboard */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => navigateTo('/')}
          >
            <ArrowLeft size={16} color={Colors.electricCyan} />
          </TouchableOpacity>
          <ShieldAlert size={22} color={Colors.electricCyan} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.brandTitle}>SkyGround Operations</Text>
            <Text style={styles.brandSubtitle}>Accra Live Inundation Monitor</Text>
          </View>
        </View>

        <View style={styles.userActions}>
          {currentUser && (
            <View style={styles.userBadge}>
              <User size={14} color={Colors.electricCyan} />
              <Text style={styles.userEmail}>
                {currentUser.fullName || currentUser.email} ({currentUser.role})
              </Text>
            </View>
          )}

          {isAuthenticated ? (
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={14} color={Colors.crimsonEmergency} style={{ marginRight: 6 }} />
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigateTo('/login')}
            >
              <Text style={styles.loginBtnText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Interactive Screen */}
      <View style={styles.mainContent}>
        <HomeScreen />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDark,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    backgroundColor: Colors.bgSecondary,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backHomeBtn: {
    padding: 6,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderColor: 'rgba(34, 211, 238, 0.25)',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 6,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.electricCyan,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  logoutBtnText: {
    fontSize: 12,
    color: Colors.crimsonEmergency,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  loginBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
});
