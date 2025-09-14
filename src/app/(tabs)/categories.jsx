import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import CategoryCard from "@/components/CategoryCard";
import supabaseClient from "@/services/supabaseClient";
import syncService from "@/services/syncService";
import { WifiOff } from "lucide-react-native";

export default function CategoriesScreen() {
  const { colors, isDark } = useTheme();
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [categoriesData, storiesData] = await Promise.all([
        supabaseClient.fetchCategories(),
        supabaseClient.fetchStories(),
      ]);

      const uncategorizedStories = storiesData.filter(story => !story.category_id);

      if (uncategorizedStories.length > 0) {
        const uncategorizedCategory = {
          id: 'uncategorized',
          name: t('uncategorized'),
          poster_url: 'https://via.placeholder.com/150', // Replace with a suitable placeholder image
          stories_count: uncategorizedStories.length,
        };
        setCategories([uncategorizedCategory, ...(categoriesData || [])]);
        setStories(storiesData || []);
      } else {
        setCategories(categoriesData || []);
        setStories(storiesData || []);
      }

      // Check offline status by attempting connection
      const isOnline = await syncService.checkConnectivity();
      setIsOffline(!isOnline);
    } catch (error) {
      console.error("Error loading categories:", error);
      Alert.alert(t("error"), t("failed_to_load_categories"));
      setCategories([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await syncService.manualRefresh();
      if (result.success) {
        await loadData();
        if (result.updatesFound) {
          Alert.alert(t("success"), t("categories_updated_successfully"));
        }
      } else {
        Alert.alert(t("sync_failed"), result.message);
      }
    } catch (error) {
      console.error("Refresh error:", error);
      Alert.alert(t("error"), t("failed_to_load_categories"));
    } finally {
      setRefreshing(false);
    }
  }, [loadData, t]);

  useEffect(() => {
    loadData();

    const handleSync = (event) => {
      if (event.type === "sync_complete") {
        loadData();
      }
    };

    syncService.addSyncListener(handleSync);

    return () => {
      syncService.removeSyncListener(handleSync);
    };
  }, [loadData]);

  const renderCategory = ({ item }) => <CategoryCard category={item} stories={stories} />;

  const renderLoadingItem = ({ item }) => <CategoryCard loading={true} />;

  const renderEmptyComponent = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 64,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: "center",
        }}
      >
        {t("no_categories_available")}
      </Text>
    </View>
  );

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
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: language === 'ar' ? "row-reverse" : "row",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: colors.text,
            }}
          >
            {t("categories")}
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

      <FlatList
        data={
          loading
            ? Array.from({ length: 6 }).map((_, i) => ({ id: i }))
            : categories
        }
        renderItem={loading ? renderLoadingItem : renderCategory}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingTop: 8,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyComponent : null}
      />
    </View>
  );
}
