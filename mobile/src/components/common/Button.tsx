import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  fullWidth = false,
  icon,
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseClass = 'flex-row items-center justify-center py-4 px-6';
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50' : '';

  const variantClasses = {
    primary: 'bg-burgundy rounded-full',
    secondary: 'bg-white border border-[#E8E4DC] rounded-[12px]',
    outline: 'bg-transparent border border-burgundy rounded-full',
  };

  const textClasses = {
    primary: 'text-white font-medium text-[15px]',
    secondary: 'text-[#222222] font-medium text-[15px]',
    outline: 'text-burgundy font-medium text-[15px]',
  };

  const iconColor = {
    primary: '#FFFFFF',
    secondary: '#222222',
    outline: '#800020',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      className={`${baseClass} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={iconColor[variant]}
          style={{ marginRight: 8 }}
        />
      )}
      <Text className={textClasses[variant]}>{title}</Text>
    </TouchableOpacity>
  );
}
