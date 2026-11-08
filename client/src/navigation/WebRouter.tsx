import React, { useState, useEffect, useCallback } from 'react';
import { Platform, Text, View } from 'react-native';
import { WebLandingScreen } from '../screens/WebLandingScreen';
import { WebLoginScreen } from '../screens/WebLoginScreen';
import { WebSignupScreen } from '../screens/WebSignupScreen';
import { WebDashboardScreen } from '../screens/WebDashboardScreen';
import { getAuthToken, clearAuthToken } from '../services/apiClient';

export type WebRoute = '/' | '/login' | '/signup' | '/dashboard' | '/home';

const ROUTE_PATHS: WebRoute[] = ['/', '/login', '/signup', '/dashboard', '/home'];

export function getCurrentRoute(): WebRoute {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname as WebRoute;
  return ROUTE_PATHS.includes(path) ? path : '/';
}

export function navigateTo(route: WebRoute): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === route) return;
  window.history.pushState({}, '', route);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

interface WebRouterProps {
  requireAuth?: boolean;
}

export const WebRouter: React.FC<WebRouterProps> = ({ requireAuth = false }) => {
  const [route, setRoute] = useState<WebRoute>(getCurrentRoute);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      setRoute(getCurrentRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAuthenticated = !!getAuthToken();

  useEffect(() => {
    if (!ready) return;
    if (requireAuth && !isAuthenticated) {
      navigateTo('/login');
    }
    if (!requireAuth && route === '/' && isAuthenticated) {
      navigateTo('/dashboard');
    }
  }, [route, isAuthenticated, ready, requireAuth]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#05070A' }}>
        <Text style={{ color: '#F8FAFC', fontSize: 16 }}>Loading SkyGround...</Text>
      </View>
    );
  }

  const PublicRoutes: Record<WebRoute, React.ElementType> = {
    '/': WebLandingScreen,
    '/login': WebLoginScreen,
    '/signup': WebSignupScreen,
    '/dashboard': WebDashboardScreen,
    '/home': WebDashboardScreen,
  };

  const Screen = PublicRoutes[route];

  return (
    <View style={{ flex: 1, backgroundColor: '#05070A' }}>
      <Screen navigateTo={navigateTo} isAuthenticated={isAuthenticated} logout={clearAuthToken} />
    </View>
  );
};
