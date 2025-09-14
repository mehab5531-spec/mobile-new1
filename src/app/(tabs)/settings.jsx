import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sun,
  Moon,
  Smartphone,
  RefreshCw,
  Trash2,
  Info,
  Languages,
} from "lucide-react-native";
import supabaseClient from "@/services/supabaseClient";
import syncService from "@/services/syncService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";

export default function SettingsScreen() {
  const { colors, isDark, theme, toggleTheme } = useTheme();
  const { t, language, changeLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [syncing, setSyncing] = useState(false);

  const handleThemeChange = (newTheme) => {
    toggleTheme(newTheme);
  };

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const result = await syncService.manualRefresh();
      if (result.success) {
        Alert.alert(t("sync_complete"), t("stories_updated_successfully"));
      } else {
        Alert.alert(t("sync_failed"), result.message);
      }
    } catch (error) {
      Alert.alert(t("error"), "Failed to sync data");
    } finally {
      setSyncing(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      t("clear_all_data_prompt_title"),
      t("clear_all_data_prompt_message"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("clear"),
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all Supabase cache data
              await AsyncStorage.multiRemove([
                "supabase_categories_cache",
                "supabase_stories_cache",
                "last_sync_time",
                "supabase_last_update",
              ]);
              Alert.alert(t("success"), t("cache_cleared_successfully"));
            } catch (error) {
              console.error("Error clearing cache:", error);
              Alert.alert(t("error"), t("failed_to_clear_cache"));
            }
          },
        },
      ],
    );
  };

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    rightElement,
  }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: colors.card,
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 12,
      }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Icon size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600", 
            color: colors.text,
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  const ThemeOption = ({
    themeValue,
    icon: Icon,
    label,
    selected,
    onPress,
  }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        backgroundColor: selected ? colors.primary + "20" : colors.surface,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.primary : colors.border,
      }}
      onPress={() => onPress(themeValue)}
    >
      <Icon
        size={20}
        color={selected ? colors.primary : colors.textSecondary}
      />
      <Text
        style={{
          fontSize: 16,
          color: selected ? colors.primary : colors.text,
          marginLeft: 12,
          fontWeight: selected ? "600" : "normal",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: colors.text,
          }}
        >
          {t("settings")}
        </Text>
      </BlurView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            {t("appearance")}
          </Text>

          <View
            style={{
              backgroundColor: colors.card,
              marginHorizontal: 16,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              {t("theme")}
            </Text>

            <ThemeOption
              themeValue="light"
              icon={Sun}
              label={t("light")}
              selected={theme === "light"}
              onPress={handleThemeChange}
            />

            <ThemeOption
              themeValue="dark"
              icon={Moon}
              label={t("dark")}
              selected={theme === "dark"}
              onPress={handleThemeChange}
            />

            <ThemeOption
              themeValue="system"
              icon={Smartphone}
              label={t("system")}
              selected={theme === "system"}
              onPress={handleThemeChange}
            />
          </View>
        </View>

        {/* Language Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            {t("language")}
          </Text>

          <View
            style={{
              backgroundColor: colors.card,
              marginHorizontal: 16,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <ThemeOption
              themeValue="en"
              icon={Languages}
              label={t("english")}
              selected={language === "en"}
              onPress={handleLanguageChange}
            />

            <ThemeOption
              themeValue="ar"
              icon={Languages}
              label={t("arabic")}
              selected={language === "ar"}
              onPress={handleLanguageChange}
            />
          </View>
        </View>


        {/* Data Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            {t("data_management")}
          </Text>

          <SettingItem
            icon={RefreshCw}
            title={t("sync_now")}
            subtitle={t("check_for_new_stories_and_updates")}
            onPress={handleManualSync}
            rightElement={
              syncing && (
                <Text style={{ color: colors.primary, fontSize: 14 }}>
                  {t("syncing")}
                </Text>
              )
            }
          />

          <SettingItem
            icon={Trash2}
            title={t("clear_all_data")}
            subtitle={t("remove_all_downloaded_stories_and_categories")}
            onPress={handleClearData}
          />
        </View>

        {/* About Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginHorizontal: 16,
              marginBottom: 12,
            }}
          >
            {t("about")}
          </Text>

{/* about section with link to /about */}
          <View
            style={{
              backgroundColor: colors.card,
              marginHorizontal: 16,
              borderRadius: 12,
            }}
          >
            <Link href="/about">
              <SettingItem
                icon={Info}
                title={t("about")}
                subtitle={t("version_1.0.0")}
              />
            </Link>
          </View>

        </View>

        {/* Footer */}
        <View style={{ marginTop: 32, paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            {t("stories_are_automatically_synced_weekly")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
