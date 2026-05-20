import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { Typography } from '../../constants/typography';

interface AppTextProps extends TextProps {
  variant?: 'headline' | 'body' | 'label';
  weight?: 'regular' | 'medium' | 'bold';
}

const fontMap: Record<string, string> = {
  'headline-regular': Typography.fonts.headline,
  'headline-bold': 'LibreCaslon-Bold',
  'body-regular': Typography.fonts.body,
  'body-medium': 'PlusJakartaSans-Medium',
  'body-bold': 'PlusJakartaSans-Bold',
  'label-regular': Typography.fonts.label,
  'label-medium': 'PlusJakartaSans-Medium',
  'label-bold': 'PlusJakartaSans-Bold',
};

export function AppText({ variant = 'body', weight = 'regular', style, ...props }: AppTextProps) {
  const fontFamily = fontMap[`${variant}-${weight}`] || fontMap['body-regular'];

  return <RNText style={[{ fontFamily } as TextStyle, style]} {...props} />;
}
