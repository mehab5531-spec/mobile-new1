import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import Carousel from 'react-native-reanimated-carousel';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const FeaturedCarousel = ({ stories, loading = false }) => {
  const { colors } = useTheme();

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          marginHorizontal: 8,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: colors.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
        onPress={() => router.push(`/story/${item.id}`)}
        activeOpacity={0.9}
      >
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: item.poster_url }}
            style={{
              width: '100%',
              height: 200,
              backgroundColor: colors.surface,
            }}
            contentFit="cover"
            transition={200}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              padding: 16,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: '600',
                marginBottom: 4,
              }}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <Text
              style={{
                color: '#E0E0E0',
                fontSize: 14,
                opacity: 0.9,
              }}
              numberOfLines={1}
            >
              by {item.author}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLoadingItem = () => (
    <View
      style={{
        marginHorizontal: 8,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.surface,
        height: 200,
      }}
    >
      <View
        style={{
          width: '100%',
          height: 140,
          backgroundColor: colors.border,
        }}
      />
      <View style={{ padding: 16 }}>
        <View
          style={{
            height: 16,
            backgroundColor: colors.border,
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
        <View
          style={{
            height: 12,
            backgroundColor: colors.border,
            borderRadius: 6,
            width: '60%',
          }}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ height: 200 }}>
        <Carousel
          data={[1, 2, 3]}
          renderItem={renderLoadingItem}
          width={screenWidth - 32}
          height={200}
          style={{ width: screenWidth }}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
          autoPlay={false}
          scrollAnimationDuration={800}
        />
      </View>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <View
        style={{
          height: 200,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: 16,
          margin: 16,
        }}
      >
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
          No featured stories available
        </Text>
      </View>
    );
  }

  return (
    <View style={{ height: 200 }}>
      <Carousel
        data={stories}
        renderItem={renderItem}
        width={screenWidth - 32}
        height={200}
        style={{ width: screenWidth }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        autoPlay={true}
        autoPlayInterval={4000}
        scrollAnimationDuration={800}
        loop={stories.length > 1}
      />
    </View>
  );
};

export default FeaturedCarousel;