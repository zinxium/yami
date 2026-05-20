import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Login: undefined;
  Signup: undefined;
  MyLoans: undefined;
  Borrowers: undefined;
  AddBorrower: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  LoansTab: NavigatorScreenParams<LoansStackParamList>;
  PayTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  LoanDetail: { loanId: string };
};

export type LoansStackParamList = {
  CreateLoan: undefined;
  LoanDetail: { loanId: string };
};

export type OnboardingProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
export type DashboardProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Dashboard'>,
  BottomTabScreenProps<MainTabParamList>
>;
export type CreateLoanProps = NativeStackScreenProps<LoansStackParamList, 'CreateLoan'>;
export type LoanDetailProps = NativeStackScreenProps<HomeStackParamList, 'LoanDetail'>;
