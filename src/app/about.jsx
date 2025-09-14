import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import supabaseClient from '@/services/supabaseClient';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

const AboutScreen = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const data = await supabaseClient.fetchStoryByIdx(9999);
        if (data) {
          setAboutContent(data.content);
        }
      } catch (error) {
        console.error('Error fetching about page content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ArrowLeft size={24} color={colors.text} />
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>{t('about')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <MarkdownRenderer content={aboutContent} />
        )}
      </ScrollView>
    </View>
  );
};

export default AboutScreen;