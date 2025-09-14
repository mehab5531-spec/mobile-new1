import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowLeft,
  Calendar,
  User,
  Share2,
  ArrowRightCircleIcon,
} from "lucide-react-native";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import supabaseClient from "@/services/supabaseClient";

export default function StoryScreen() {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextStory, setNextStory] = useState(null);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const scrollY = useSharedValue(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadStory();
  }, [id]);

  const loadStory = async () => {
    setLoading(true);
    setStory(null);
    setNextStory(null);
    try {
      const storyData = await supabaseClient.fetchStoryById(id);
      if (storyData) {
        setStory(storyData);
        findNextStory(storyData.category_id, storyData.idx);
      } else {
        Alert.alert(t("error"), t("story_not_found"));
        router.back();
      }
    } catch (error) {
      console.error("Error loading story:", error);
      Alert.alert(t("error"), t("failed_to_load_story"));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const findNextStory = async (categoryId, currentStoryIndex) => {
    try {
      const allStories =
        await supabaseClient.fetchStoriesByCategory(categoryId);
      const currentIndex = allStories.findIndex((s) => s.id === id);
      if (currentIndex !== -1 && currentIndex < allStories.length - 1) {
        setNextStory(allStories[currentIndex + 1]);
      } else {
        setNextStory(null);
      }
    } catch (error) {
      console.error("Error finding next story:", error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${story.title}\n\n${t("by")} ${story.author}\n\n${story.content}\n\n- ${t("shared_from_stories_app")}`,
      });
    } catch (error) {
      Alert.alert(t("error"), t("failed_to_share_story"));
    }
  };

  const handleNextStory = () => {
    if (nextStory) {
      router.replace(`/story/${nextStory.id}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollY.value = currentScrollY;

    const shouldCollapse = currentScrollY > 300;
    if (shouldCollapse !== isHeaderCollapsed) {
      runOnJS(setIsHeaderCollapsed)(shouldCollapse);
    }
  };

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 100],
      [60, 40],
      Extrapolate.CLAMP,
    );
    return { height };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolate.CLAMP,
    );
    return { opacity };
  });

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={{
            paddingTop: 0,
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDark
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.2)",
            flexDirection: "row",
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surface,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
        </BlurView>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: 120,
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              width: "100%",
              height: 450,
              backgroundColor: colors.surface,
              borderRadius: 12,
              marginBottom: 16,
            }}
          />
          <View
            style={{
              height: 24,
              backgroundColor: colors.surface,
              borderRadius: 12,
              marginBottom: 8,
            }}
          />
          <View
            style={{
              height: 16,
              backgroundColor: colors.surface,
              borderRadius: 8,
              width: "60%",
              marginBottom: 24,
            }}
          />
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              key={index}
              style={{
                height: 16,
                backgroundColor: colors.surface,
                borderRadius: 8,
                marginBottom: 8,
                width: index === 4 ? "80%" : "100%",
              }}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!story) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          },
          headerAnimatedStyle,
        ]}
      >
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={{
            flex: 1,
            borderBottomWidth: 1,
            borderBottomColor: isDark
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.2)",
            justifyContent: "flex-end",
            paddingHorizontal: 16,
            paddingBottom: 4,
            paddingTop: 48,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.surface,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Animated.Text
              style={[
                {
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                  marginLeft: 16,
                  flex: 1,
                },
                titleAnimatedStyle,
              ]}
              numberOfLines={1}
            >
              {story.title}
            </Animated.Text>
          </View>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 60,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Story Image – الغلاف الداخلي 450px */}
        <Image
          source={{ uri: story.poster_url }}
          style={{
            width: "100%",
            height: 450, // تم تكبيره حسب طلبك
            backgroundColor: colors.surface,
          }}
          contentFit="cover"
          transition={70}
        />

        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: colors.text,
              lineHeight: 34,
              marginBottom: 12,
            }}
          >
            {story.idx} - {story.title}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <User size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                }}
              >
                {story.author}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                {formatDate(story.created_at)}
              </Text>
            </View>
          </View>

          {story.category_name && (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {story.category_name}
              </Text>
            </View>
          )}

          <MarkdownRenderer content={story.content} />

          <View
            style={{
              marginTop: 32,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={handleShare}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.surface,
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 25,
              }}
            >
              <Share2 size={18} color={colors.text} />
              <Text
                style={{ color: colors.text, marginLeft: 8, fontWeight: "600" }}
              >
                {t("share")}
              </Text>
            </TouchableOpacity>

            {nextStory && (
              <TouchableOpacity
                onPress={handleNextStory}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 25,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    marginRight: 8,
                    fontWeight: "600",
                  }}
                >
                  {t("next_story")}
                </Text>
                <ArrowRightCircleIcon size={20} style={{ color: "#FFFFFF" }} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
