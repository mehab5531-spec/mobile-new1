import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

const CategoryCard = ({ category, stories, loading = false }) => {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          margin: 8,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: colors.surface,
          aspectRatio: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.border,
          }}
        />
        <View style={{ padding: 12 }}>
          <View
            style={{
              height: 16,
              backgroundColor: colors.border,
              borderRadius: 8,
              width: '80%',
            }}
          />
        </View>
      </View>
    );
  }

  const storyCount = stories ? stories.filter(story => story.category_id === category.id).length : category.stories_count;

  return (
    <TouchableOpacity
      style={{
        flex: 1,
        margin: 8,
        overflow: 'hidden',
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: colors.radius,
      }}
      onPress={() => router.push(`/category/${category.id}`)}
      activeOpacity={0.8}
    >
      <View style={{ aspectRatio: 1 }}>
        <Image
          source={{ uri: category.poster_url }}
          style={{
            width: '100%',
            height: '75%',
            backgroundColor: colors.surface,
          }}
          contentFit="cover"
          transition={200}
        />
        <View
          style={{
            height: '25%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 8,
            backgroundColor: colors.card,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              fontWeight: '600',
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {category.name}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: '500',
              marginTop: 4,
            }}
          >
            {storyCount}{' '}
            {storyCount === 1 ? 'story' : 'stories'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CategoryCard;