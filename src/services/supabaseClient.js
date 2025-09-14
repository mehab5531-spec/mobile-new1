import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Environment variables - these should be set in your .env file
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // No auth needed for this app
  },
});

// Local storage keys
const LAST_UPDATE_KEY = 'supabase_last_update'; 
const CATEGORIES_CACHE_KEY = 'supabase_categories_cache';
const STORIES_CACHE_KEY = 'supabase_stories_cache';
class SupabaseService {

  // Get cached data
  async getCachedCategories() {
    try {
      const cached = await AsyncStorage.getItem(CATEGORIES_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting cached categories:', error);
      return [];
    }
  }

  async getCachedStories() {
    try {
      const cached = await AsyncStorage.getItem(STORIES_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting cached stories:', error);
      return [];
    }
  }

  // Cache data locally
  async cacheCategories(categories) {
    try {
      await AsyncStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error caching categories:', error);
    }
  }

  async cacheStories(stories) {
    try {
      await AsyncStorage.setItem(STORIES_CACHE_KEY, JSON.stringify(stories));
    } catch (error) {
      console.error('Error caching stories:', error);
    }
  }

  // Fetch categories from remote
  async fetchRemoteCategories() {
    try {
      console.log('📦 SupabaseClient: Fetching categories from remote...');
      let query = supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      const { data, error } = await query;
      console.log('📦 SupabaseClient: Remote categories query result:', { data: data?.length || 0, error });

      if (error) {
        console.error('📦 SupabaseClient: Remote categories error:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log('📦 SupabaseClient: Categories fetched from remote successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('📦 SupabaseClient: Error fetching remote categories:', error);
      throw error;
    }
  }

  // Fetch stories from remote
  async fetchRemoteStories() {
    try {
      console.log('📦 SupabaseClient: Fetching stories from remote...');
      let query = supabase
        .from('stories')
        .select('*, author')
        .order('idx', { ascending: true });

      const { data, error } = await query;
      console.log('📦 SupabaseClient: Remote stories query result:', { data: data?.length || 0, error });

      if (error) {
        console.error('📦 SupabaseClient: Remote stories error:', error);
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log('📦 SupabaseClient: Stories fetched from remote successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('📦 SupabaseClient: Error fetching remote stories:', error);
      throw error;
    }
  }

  async fetchCategories() {
    try {
      const remoteCategories = await this.fetchRemoteCategories();
      await this.cacheCategories(remoteCategories);
      return remoteCategories;
    } catch (error) {
      console.error('📦 SupabaseClient: Error in smart categories fetch:', error);
      // Fallback to cache on error
      console.log('📦 SupabaseClient: Falling back to cached categories');
      return await this.getCachedCategories();
    }
  }

  async fetchStories() {
    try {
      const remoteStories = await this.fetchRemoteStories();
      await this.cacheStories(remoteStories);
      return remoteStories;
    } catch (error) {
      console.error('📦 SupabaseClient: Error in smart stories fetch:', error);
      // Fallback to cache on error
      console.log('📦 SupabaseClient: Falling back to cached stories');
      return await this.getCachedStories();
    }
  }

  // Fetch stories by category (from cache)
  async fetchStoriesByCategory(categoryId) {
    try {
      const stories = await this.getCachedStories();
      return stories.filter(story => story.category_id === categoryId) || [];
    } catch (error) {
      console.error('Error fetching stories by category:', error);
      return [];
    }
  }

  // Fetch featured stories (from cache)
  async fetchFeaturedStories() {
    try {
      const stories = await this.getCachedStories();
      return stories.filter(story => story.idx % 5 === 0);
    } catch (error) {
      console.error('Error fetching featured stories:', error);
      return [];
    }
  }

  // Fetch single story by ID (from cache)
  async fetchStoryById(id) {
    try {
      const stories = await this.getCachedStories();
      return stories.find(story => story.id === id) || null;
    } catch (error) {
      console.error('Error fetching story by ID:', error);
      return null;
    }
  }
  async fetchStoryByIdx(idx) {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('content')
        .eq('idx', idx)
        .single();
      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error(`Error fetching story by idx ${idx}:`, error);
      return null;
    }
  }
  // Check connection to Supabase
  async checkConnection() {
    try {
      console.log('🔗 SupabaseClient: Checking connection...');
      const { error } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('🔗 SupabaseClient: Connection error:', error);
        throw new Error(`Connection failed: ${error.message}`);
      }

      console.log('🔗 SupabaseClient: Connection successful');
      return true;
    } catch (error) {
      console.error('🔗 SupabaseClient: Connection check failed:', error);
      return false;
    }
  }

  // Force sync both categories and stories
  async forceSync() {
    console.log('📦 SupabaseClient: Starting force sync...');
    try {
      const [categories, stories] = await Promise.all([
        this.fetchRemoteCategories(),
        this.fetchRemoteStories()
      ]);

      if (categories.length > 0) {
        await this.cacheCategories(categories);
      }
      if (stories.length > 0) {
        await this.cacheStories(stories);
      }

      await this.setLastUpdate();
      console.log('📦 SupabaseClient: Force sync completed');
      return { categories, stories };
    } catch (error) {
      console.error('📦 SupabaseClient: Force sync error:', error);
      throw error;
    }
  }

  // Get database statistics (from cache)
  async getDatabaseStats() {
    try {
      const [categories, stories] = await Promise.all([
        this.getCachedCategories(),
        this.getCachedStories()
      ]);

      return {
        categoriesCount: categories.length,
        storiesCount: stories.length,
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        categoriesCount: 0,
        storiesCount: 0,
      };
    }
  }

  // Batch fetch with progress callback
  async batchFetchData(onProgress = null, force = false) {
    try {
      console.log('📦 SupabaseClient: Starting batch fetch...', { force });
      const steps = [
        { name: 'categories', action: () => this.fetchCategories(force) },
        { name: 'stories', action: () => this.fetchStories(force) },
      ];

      const results = {};

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        console.log(`📦 SupabaseClient: Fetching ${step.name}...`);

        if (onProgress) {
          onProgress({
            step: i + 1,
            total: steps.length,
            message: `Fetching ${step.name}...`,
            progress: ((i + 1) / steps.length) * 100
          });
        }

        results[step.name] = await step.action();
        console.log(`📦 SupabaseClient: Fetched ${results[step.name].length} ${step.name}`);
      }

      console.log('📦 SupabaseClient: Batch fetch complete');
      return results;
    } catch (error) {
      console.error('📦 SupabaseClient: Batch fetch error:', error);
      throw error;
    }
  }
}

export default new SupabaseService();
