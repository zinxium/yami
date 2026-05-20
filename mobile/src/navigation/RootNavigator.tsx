import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
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
import { Colors } from '../constants/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.neutral }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
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
