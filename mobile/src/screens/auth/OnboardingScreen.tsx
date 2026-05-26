import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Logo } from '../../components/common';
import type { OnboardingProps } from '../../navigation/types';

const { width } = Dimensions.get('window');

interface OnboardingPage {
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  subtitleKey: string;
  iconBg: string;
}

const PAGES: OnboardingPage[] = [
  { icon: 'shield-checkmark-outline', titleKey: 'onboarding.page1Title', subtitleKey: 'onboarding.page1Subtitle', iconBg: '#800020' },
  { icon: 'bar-chart-outline', titleKey: 'onboarding.page2Title', subtitleKey: 'onboarding.page2Subtitle', iconBg: '#D4A574' },
  { icon: 'notifications-outline', titleKey: 'onboarding.page3Title', subtitleKey: 'onboarding.page3Subtitle', iconBg: '#4D0013' },
];

export function OnboardingScreen({ navigation }: OnboardingProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastPage = currentIndex === PAGES.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (isLastPage) return;
    flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
  };

  return (
    <View className="flex-1 bg-cream">
      {/* Header: Logo + Skip */}
      <View
        className="flex-row items-center justify-between px-6"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center gap-2">
          <Logo size="small" />
          <Text className="text-burgundy text-[18px] font-bold" style={{ fontFamily: 'LibreCaslon-Bold' }}>
            Ya Mi
          </Text>
        </View>
        {!isLastPage && (
          <TouchableOpacity onPress={() => flatListRef.current?.scrollToIndex({ index: PAGES.length - 1, animated: true })}>
            <Text className="text-[#888888] text-[14px]">{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pages */}
      <FlatList
        ref={flatListRef}
        data={PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 justify-center items-center px-8">
            {/* Icon circle */}
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-8"
              style={{ backgroundColor: item.iconBg + '15' }}
            >
              <Ionicons name={item.icon} size={44} color={item.iconBg} />
            </View>

            {/* Title */}
            <Text
              className="text-center text-[#222222] text-[30px] font-bold leading-[38px] mb-4"
              style={{ fontFamily: 'LibreCaslon-Bold' }}
            >
              {t(item.titleKey)}
            </Text>

            {/* Subtitle */}
            <Text className="text-center text-[#888888] text-[15px] leading-[22px] px-4">
              {t(item.subtitleKey)}
            </Text>
          </View>
        )}
      />

      {/* Bottom section */}
      <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
        {/* Dots */}
        <View className="flex-row justify-center gap-2 mb-6">
          {PAGES.map((_, i) => (
            <View
              key={i}
              className="rounded-full"
              style={{
                width: currentIndex === i ? 24 : 8,
                height: 8,
                backgroundColor: currentIndex === i ? '#800020' : '#E8E4DC',
              }}
            />
          ))}
        </View>

        {isLastPage ? (
          <>
            {/* CTA buttons on last page */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              className="bg-burgundy rounded-[12px] py-4 items-center mb-3"
              activeOpacity={0.8}
            >
              <Text className="text-white text-[16px] font-bold">{t('onboarding.createAccount')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="border border-[#E8E4DC] bg-white rounded-[12px] py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-burgundy text-[15px] font-bold">{t('onboarding.haveAccount')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Next button */
          <TouchableOpacity
            onPress={goToNext}
            className="bg-burgundy rounded-[12px] py-4 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white text-[16px] font-bold mr-2">{t('onboarding.next')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
