import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import StoryCard from "@/components/StoryCard";
import supabaseClient from "@/services/supabaseClient";
import syncService from "@/services/syncService";
import { WifiOff } from "lucide-react-native";

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [featuredStories, setFeaturedStories] = useState([]);
  const [recentStories, setRecentStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadData = useCallback(
    async (syncedData = null) => {
      setLoading(true);
      try {
        let featured = [];
        let recent = [];

        if (syncedData) {
          // Use data from the sync operation
          const { stories } = syncedData;
          featured = stories.filter((s) => s.idx % 5 === 0);
          recent = (stories || [])
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);
        } else {
          // Fallback to cached data if no fresh data is provided
          const cached = await syncService.getCachedData();
          featured = (cached.stories || []).filter((s) => s.idx % 5 === 0);
          recent = (cached.stories || [])
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);
        }

        setFeaturedStories(featured);
        setRecentStories(recent);

        const isOnline = await syncService.checkConnectivity();
        setIsOffline(!isOnline);
      } catch (error) {
        console.error("Error loading data:", error);
        Alert.alert(t("error"), t("failed_to_load_stories"));
        setFeaturedStories([]);
        setRecentStories([]);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await syncService.manualRefresh();
      if (result.success) {
        await loadData(result.data);
        if (result.updatesFound) {
          Alert.alert(t("success"), t("stories_updated_successfully"));
        }
      } else {
        Alert.alert(t("sync_failed"), result.message);
      }
    } catch (error) {
      console.error("Refresh error:", error);
      Alert.alert(t("error"), t("failed_to_load_stories"));
    } finally {
      setRefreshing(false);
    }
  }, [loadData, t]);

  useEffect(() => {
    loadData();

    const handleSync = (event) => {
      if (event.type === "sync_complete" && event.data) {
        // Pass synced data directly to loadData
        loadData(event.data);
      }
    };

    syncService.addSyncListener(handleSync);

    return () => {
      syncService.removeSyncListener(handleSync);
    };
  }, [loadData]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <BlurView
        intensity={80}
        tint={isDark ? "dark" : "light"}
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark
            ? "rgba(255,255,255,0.2)"
            : "rgba(0,0,0,0.2)",
        }}
      >
        <View
          style={{
            flexDirection: language === 'ar' ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: colors.text,
            }}
          >
            {t("stories")}
          </Text>
          {isOffline && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <WifiOff size={16} color={colors.textSecondary} />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                {t("offline")}
              </Text>
            </View>
          )}
        </View>
      </BlurView>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Featured Stories Section */}
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: colors.text,
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            {t("featured_stories")}
          </Text>
          <FeaturedCarousel stories={featuredStories} loading={loading} />
        </View>

        {/* Recent Stories Section */}
        <View style={{ marginTop: 32, marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: colors.text,
              marginHorizontal: 16,
              marginBottom: 16,
            }}
          >
            {t("recent_stories")}
          </Text>

          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <StoryCard key={index} loading={true} />
            ))
          ) : recentStories.length > 0 ? (
            recentStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))
          ) : (
            <View
              style={{
                padding: 32,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                {t("no_stories_available")}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom spacing for floating tab bar */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}
