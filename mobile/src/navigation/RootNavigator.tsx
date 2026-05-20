import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { MyLoansScreen } from '../screens/loans/MyLoansScreen';
import { BorrowersScreen } from '../screens/loans/BorrowersScreen';
import { AddBorrowerScreen } from '../screens/loans/AddBorrowerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="MyLoans" component={MyLoansScreen} />
      <Stack.Screen name="Borrowers" component={BorrowersScreen} />
      <Stack.Screen name="AddBorrower" component={AddBorrowerScreen} />
    </Stack.Navigator>
  );
}
