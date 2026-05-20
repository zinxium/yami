import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { Borrower } from '../types';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  MyLoans: undefined;
  Borrowers: undefined;
  AddBorrower: undefined;
  EditBorrower: { borrower: Borrower };
  AddPayment: { loanId: string };
  Contract: { loanId: string };
  Notifications: undefined;
  EditLoan: { loanId: string };
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
export type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type SignupProps = NativeStackScreenProps<RootStackParamList, 'Signup'>;
export type DashboardProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Dashboard'>,
  BottomTabScreenProps<MainTabParamList>
>;
export type CreateLoanProps = NativeStackScreenProps<LoansStackParamList, 'CreateLoan'>;
export type LoanDetailProps = NativeStackScreenProps<HomeStackParamList, 'LoanDetail'>;
export type AddPaymentProps = NativeStackScreenProps<RootStackParamList, 'AddPayment'>;
export type ContractProps = NativeStackScreenProps<RootStackParamList, 'Contract'>;
export type EditBorrowerProps = NativeStackScreenProps<RootStackParamList, 'EditBorrower'>;
export type EditLoanProps = NativeStackScreenProps<RootStackParamList, 'EditLoan'>;
