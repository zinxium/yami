import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth.store';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { MainTabs } from './MainTabs';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { MyLoansScreen } from '../screens/loans/MyLoansScreen';
import { BorrowersScreen } from '../screens/loans/BorrowersScreen';
import { AddBorrowerScreen } from '../screens/loans/AddBorrowerScreen';
import { AddPaymentScreen } from '../screens/payments/AddPaymentScreen';
import { ContractScreen } from '../screens/loans/ContractScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { EditBorrowerScreen } from '../screens/loans/EditBorrowerScreen';
import { EditLoanScreen } from '../screens/loans/EditLoanScreen';
import { AnimatedSplash } from '../components/common/AnimatedSplash';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MIN_SPLASH_MS = 2500;

export function RootNavigator() {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const finish = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
      setTimeout(() => setSplashDone(true), remaining);
    };
    try {
      const result = restoreSession();
      if (result && typeof result.then === 'function') {
        result.then(finish).catch(finish);
      } else {
        finish();
      }
    } catch {
      finish();
    }
  }, []);

  if (!splashDone) {
    return <AnimatedSplash />;
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'Main' : 'Onboarding'}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : null}
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="MyLoans" component={MyLoansScreen} />
      <Stack.Screen name="Borrowers" component={BorrowersScreen} />
      <Stack.Screen name="AddBorrower" component={AddBorrowerScreen} />
      <Stack.Screen name="AddPayment" component={AddPaymentScreen} />
      <Stack.Screen name="Contract" component={ContractScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EditBorrower" component={EditBorrowerScreen} />
      <Stack.Screen name="EditLoan" component={EditLoanScreen} />
    </Stack.Navigator>
  );
}
