import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { useTheme } from '../../hooks/useTheme';

interface SuccessModalProps {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export function SuccessModal({
  visible,
  icon = 'checkmark-circle',
  title,
  message,
  buttonText = 'OK',
  onClose,
}: SuccessModalProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      checkScale.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(checkScale, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', opacity: opacityAnim }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            backgroundColor: colors.surface,
            borderRadius: 20,
            paddingVertical: 32,
            paddingHorizontal: 28,
            alignItems: 'center',
            marginHorizontal: 32,
            width: '85%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Animated.View
            style={{
              transform: [{ scale: checkScale }],
              backgroundColor: colors.success + '15',
              borderRadius: 40,
              width: 80,
              height: 80,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Ionicons name={icon} size={44} color={colors.success} />
          </Animated.View>

          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.textPrimary,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: 28,
            }}
          >
            {message}
          </Text>

          <Button title={buttonText} onPress={onClose} variant="primary" fullWidth />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
