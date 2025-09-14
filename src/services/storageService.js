import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CATEGORIES: 'stories_categories',
  STORIES: 'stories_stories',
  LAST_SYNC: 'stories_last_sync',
  OFFLINE_MODE: 'stories_offline_mode',
};

class StorageService {
  // Categories
  async getCategories() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting categories from storage:', error);
      return [];
    }
  }

  async saveCategories(categories) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return true;
    } catch (error) {
      console.error('Error saving categories to storage:', error);
      return false;
    }
  }

  // Stories
  async getStories() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting stories from storage:', error);
      return [];
    }
  }

  async saveStories(stories) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
      return true;
    } catch (error) {
      console.error('Error saving stories to storage:', error);
      return false;
    }
  }

  async getStoriesByCategory(categoryId) {
    try {
      const stories = await this.getStories();
      return stories.filter(story => story.category_id === categoryId);
    } catch (error) {
      console.error('Error getting stories by category:', error);
      return [];
    }
  }

  async getFeaturedStories() {
    try {
      const stories = await this.getStories();
      return stories.filter(story => story.is_featured);
    } catch (error) {
      console.error('Error getting featured stories:', error);
      return [];
    }
  }

  async getStoryById(id) {
    try {
      const stories = await this.getStories();
      return stories.find(story => story.id === id) || null;
    } catch (error) {
      console.error('Error getting story by id:', error);
      return null;
    }
  }

  // Sync management
  async getLastSyncTime() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return data ? new Date(data) : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  async setLastSyncTime(date = new Date()) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, date.toISOString());
      return true;
    } catch (error) {
      console.error('Error setting last sync time:', error);
      return false;
    }
  }

  // Offline mode
  async getOfflineMode() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
      return data === 'true';
    } catch (error) {
      console.error('Error getting offline mode:', error);
      return false;
    }
  }

  async setOfflineMode(isOffline) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, isOffline.toString());
      return true;
    } catch (error) {
      console.error('Error setting offline mode:', error);
      return false;
    }
  }

  // Merge data (for sync)
  async mergeCategories(newCategories) {
    try {
      const existingCategories = await this.getCategories();
      const merged = this.mergeArrays(existingCategories, newCategories, 'id');
      await this.saveCategories(merged);
      return merged;
    } catch (error) {
      console.error('Error merging categories:', error);
      return [];
    }
  }

  async mergeStories(newStories) {
    try {
      const existingStories = await this.getStories();
      const merged = this.mergeArrays(existingStories, newStories, 'id');
      await this.saveStories(merged);
      return merged;
    } catch (error) {
      console.error('Error merging stories:', error);
      return [];
    }
  }

  // Helper method to merge arrays by unique key
  mergeArrays(existing, incoming, keyField) {
    const existingMap = new Map(existing.map(item => [item[keyField], item]));
    
    // Add or update items from incoming data
    incoming.forEach(item => {
      const existingItem = existingMap.get(item[keyField]);
      if (!existingItem || new Date(item.updated_at) > new Date(existingItem.updated_at)) {
        existingMap.set(item[keyField], item);
      }
    });
    
    return Array.from(existingMap.values());
  }

  // Clear all data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.STORIES,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.OFFLINE_MODE,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
}

export default new StorageService();