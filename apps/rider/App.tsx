import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BootSplash } from './src/components/BootSplash';
import { colors } from './src/config/brand';
import { AuthProvider, useAppAuth } from './src/features/auth/AuthProvider';
import { MainShell } from './src/navigation/MainShell';
import { PhoneAuthScreen } from './src/screens/PhoneAuthScreen';
import { ProfileSetupScreen } from './src/screens/ProfileSetupScreen';
import { TripScreen } from './src/screens/TripScreen';

export type RootStackParamList = {
  PhoneAuth: undefined;
  Main: undefined;
  Home: undefined;
  Trip: { tripId: string };
  Receipts: undefined;
  ReportIncident: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppTree() {
  const { state, profile, profileLoading, refreshProfile } = useAppAuth();

  const booting = state.status === 'loading' || (state.status === 'authenticated' && profileLoading);
  const needsProfile =
    state.status === 'authenticated' &&
    state.source === 'supabase' &&
    !profileLoading &&
    (profile == null || !profile.onboarding_completed_at);

  return (
    <>
      <StatusBar style="dark" />
      {booting ? (
        <BootSplash />
      ) : state.status !== 'authenticated' ? (
        <PhoneAuthScreen />
      ) : needsProfile ? (
        <ProfileSetupScreen onDone={refreshProfile} />
      ) : (
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerTintColor: colors.ink,
              headerStyle: { backgroundColor: colors.background },
              headerShadowVisible: false,
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {() => <MainShell displayName={profile?.display_name} phone={profile?.phone} />}
            </Stack.Screen>
            <Stack.Screen name="Trip" component={TripScreen} options={{ title: 'Votre course' }} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppTree />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
