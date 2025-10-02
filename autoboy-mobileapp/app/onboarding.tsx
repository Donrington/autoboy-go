import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Buy & Sell Gadgets',
    subtitle: 'Discover amazing deals on phones, laptops, gaming gear and more',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=400&fit=crop',
    gradient: ['#6366F1', '#8B5CF6']
  },
  {
    id: 2,
    title: 'Smart Swap System',
    subtitle: 'Trade your old devices for new ones with our intelligent matching',
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=400&fit=crop',
    gradient: ['#8B5CF6', '#A855F7']
  },
  {
    id: 3,
    title: 'Secure Transactions',
    subtitle: 'Shop with confidence using our escrow system and verified sellers',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=400&fit=crop',
    gradient: ['#A855F7', '#EC4899']
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);

  const nextSlide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      translateX.value = withTiming(-(currentIndex + 1) * width);
    } else {
      router.replace('/auth/login');
    }
  };

  const skipOnboarding = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/auth/login');
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const OnboardingSlide = ({ item, index }: { item: any; index: number }) => {
    const slideAnimatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateX.value,
        [(index - 1) * width, index * width, (index + 1) * width],
        [0.5, 1, 0.5],
        Extrapolate.CLAMP
      );
      
      const scale = interpolate(
        translateX.value,
        [(index - 1) * width, index * width, (index + 1) * width],
        [0.8, 1, 0.8],
        Extrapolate.CLAMP
      );

      return {
        opacity,
        transform: [{ scale }],
      };
    });

    return (
      <Animated.View style={[styles.slide, slideAnimatedStyle]}>
        <LinearGradient colors={item.gradient} style={styles.slideGradient}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.slideImage} />
            <View style={styles.imageOverlay} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipBtn} onPress={skipOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.View style={[styles.slidesContainer, animatedStyle]}>
        {onboardingData.map((item, index) => (
          <OnboardingSlide key={item.id} item={item} index={index} />
        ))}
      </Animated.View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                  width: index === currentIndex ? 24 : 8,
                }
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextBtn} onPress={nextSlide}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.nextBtnGradient}
          >
            {currentIndex === onboardingData.length - 1 ? (
              <Text style={styles.nextBtnText}>Get Started</Text>
            ) : (
              <Ionicons name="arrow-forward" size={24} color="white" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  slidesContainer: {
    flex: 1,
    flexDirection: 'row',
    width: width * onboardingData.length,
  },
  slide: {
    width: width,
    height: height,
  },
  slideGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.5,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 40,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 30,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  nextBtnGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  nextBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

