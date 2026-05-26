import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Logo } from './Logo';

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 }),
        ),
        -1,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{
      width: 8, height: 8, borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.8)',
    }, style]} />
  );
}

export function AnimatedSplash() {
  const { t } = useTranslation();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const dotsOpacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo: fade + scale
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) });

    // Title: slide up + fade
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    titleTranslateY.value = withDelay(300, withTiming(0, { duration: 500 }));

    // Subtitle: fade
    subtitleOpacity.value = withDelay(600, withTiming(0.6, { duration: 400 }));

    // Dots: fade
    dotsOpacity.value = withDelay(900, withTiming(1, { duration: 300 }));

    // Footer: fade
    footerOpacity.value = withDelay(1000, withTiming(0.25, { duration: 400 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#800020', justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar style="light" />

      {/* Cercles décoratifs */}
      <View style={{
        position: 'absolute', top: -100, right: -100,
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.05)',
      }} />
      <View style={{
        position: 'absolute', bottom: -80, left: -80,
        width: 250, height: 250, borderRadius: 125,
        backgroundColor: 'rgba(255,255,255,0.03)',
      }} />

      {/* Logo */}
      <Animated.View style={[{
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
      }, logoStyle]}>
        <Logo size="medium" />
      </Animated.View>

      {/* Ya Mi */}
      <Animated.Text style={[{
        color: '#FFFFFF', fontSize: 32, fontWeight: 'bold',
        fontFamily: 'LibreCaslon-Bold', marginBottom: 8,
        letterSpacing: 1,
      }, titleStyle]}>
        Ya Mi
      </Animated.Text>

      {/* Sous-titre */}
      <Animated.Text style={[{
        color: '#FFFFFF', fontSize: 13,
        fontFamily: 'PlusJakartaSans', marginBottom: 48,
        letterSpacing: 0.5,
      }, subtitleStyle]}>
        {t('splash.subtitle')}
      </Animated.Text>

      {/* Loading dots */}
      <Animated.View style={[{ flexDirection: 'row', gap: 6 }, dotsStyle]}>
        <LoadingDot delay={0} />
        <LoadingDot delay={200} />
        <LoadingDot delay={400} />
      </Animated.View>

      {/* Footer */}
      <Animated.Text style={[{
        position: 'absolute', bottom: 40,
        color: '#FFFFFF', fontSize: 10,
        letterSpacing: 3, textTransform: 'uppercase',
        fontFamily: 'PlusJakartaSans',
      }, footerStyle]}>
        Fintech for Africa
      </Animated.Text>
    </View>
  );
}
