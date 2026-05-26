import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyLoansScreen } from '../screens/loans/MyLoansScreen';
import { CreateLoanScreen } from '../screens/loans/CreateLoanScreen';
import { LoanDetailScreen } from '../screens/loans/LoanDetailScreen';
import type { LoansStackParamList } from './types';

const Stack = createNativeStackNavigator<LoansStackParamList>();

export function LoansStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyLoans" component={MyLoansScreen} />
      <Stack.Screen name="CreateLoan" component={CreateLoanScreen} />
      <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
    </Stack.Navigator>
  );
}
