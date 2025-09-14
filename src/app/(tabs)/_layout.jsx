import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { BlurView } from "expo-blur";
import { Home, Grid3X3, Settings } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const TabBarIcon = ({ icon: Icon, label, focused, color }) => (
  <View style={{ alignItems: "center", justifyContent: "center", gap: 4 }}>
    <Icon
      size={24}
      color={color}
      strokeWidth={focused ? 2.5 : 2}
      fill={focused ? color : "transparent"}
    />
    {focused && (
      <Text style={{ color, fontSize: 11, fontWeight: "600" }}>{label}</Text>
    )}
  </View>
);

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
          position: "absolute",
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={{
              flex: 1,
              borderTopWidth: 1,
              borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
            }}
          />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              icon={Home}
              label={t("home")}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              icon={Grid3X3}
              label={t("categories")}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              icon={Settings}
              label={t("settings")}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
