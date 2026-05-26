import React from 'react';
import { Image, ImageProps, View } from 'react-native';

interface LogoProps extends Omit<ImageProps, 'source'> {
  size?: 'small' | 'medium' | 'large';
}

const SIZES = {
  small: { width: 40, height: 40 },
  medium: { width: 80, height: 80 },
  large: { width: 120, height: 120 },
};

export function Logo({ size = 'medium', style, ...props }: LogoProps) {
  const dimensions = SIZES[size];

  return (
    <Image
      source={require('../../../assets/yami_logo.png')}
      style={[dimensions, { resizeMode: 'contain' }, style]}
      {...props}
    />
  );
}
