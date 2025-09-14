import AsyncStorage from '@react-native-async-storage/async-storage';
import supabaseClient from './supabaseClient';

// Local storage keys for sync status
const SYNC_STATUS_KEY = 'sync_status';
const LAST_SYNC_TIME_KEY = 'last_sync_time';

class SyncService {
  constructor() {
    this.isOnline = true;
    this.isSyncing = false;
    this.syncListeners = [];
  }

  // Add listener for sync status changes
  addSyncListener(listener) {
    this.syncListeners.push(listener);
  }

  removeSyncListener(listener) {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  notifyListeners(status) {
    this.syncListeners.forEach(listener => listener(status));
  }

  // Check if device is online
  async checkConnectivity() {
    try {
      const isConnected = await supabaseClient.checkConnection();
      this.isOnline = isConnected;
      console.log('🔗 SyncService: Online check result:', this.isOnline);
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      console.log('🔗 SyncService: Online check failed:', error.message);
      return false;
    }
  }

  // Get last sync time
  async getLastSyncTime() {
    try {
      const lastSync = await AsyncStorage.getItem(LAST_SYNC_TIME_KEY);
      return lastSync ? new Date(parseInt(lastSync)) : new Date(0);
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return new Date(0);
    }
  }

  // Set last sync time
  async setLastSyncTime() {
    try {
      const now = new Date().getTime().toString();
      await AsyncStorage.setItem(LAST_SYNC_TIME_KEY, now);
      console.log('🔄 SyncService: Updated last sync time');
    } catch (error) {
      console.error('Error setting last sync time:', error);
    }
  }

  // Initial data sync (first app launch)
  async initialSync(force = false) {
    if (this.isSyncing) {
      console.log('🔄 SyncService: Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }

    console.log('🔄 SyncService: Starting initial sync...');
    this.isSyncing = true;
    this.notifyListeners({
      type: 'sync_start',
      message: 'Syncing with Supabase...'
    });

    const syncTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Sync timed out after 30 seconds')), 30000)
    );

    const syncProcess = async () => {
      try {
        console.log('🔄 SyncService: Running smart batch fetch...');
        const { categories, stories } = await supabaseClient.batchFetchData((progress) => {
          this.notifyListeners({
            type: 'sync_progress',
            ...progress
          });
        }, force);

        console.log(`🔄 SyncService: Processed ${categories.length} categories and ${stories.length} stories.`);

        if (categories.length > 0 || stories.length > 0) {
          await this.setLastSyncTime();
        }

        return {
          success: true,
          updatesFound: categories.length > 0 || stories.length > 0,
          data: { categories, stories }
        };
      } catch (error) {
        console.error('🔄 SyncService: Initial sync failed during process:', error);
        throw error;
      }
    };

    try {
      const result = await Promise.race([syncProcess(), syncTimeout]);
      this.isSyncing = false;
      this.notifyListeners({
        type: 'sync_complete',
        updatesFound: result.updatesFound,
        data: result.data,
      });
      console.log('🔄 SyncService: Initial sync completed successfully.');
      return { ...result, data: result.data };
    } catch (error) {
      console.error('🔄 SyncService: Sync process failed with error:', error);
      this.isSyncing = false;
      this.notifyListeners({
        type: 'sync_error',
        message: error.message
      });
      return { success: false, message: error.message };
    }
  }

  // Force full sync (gets all data from Supabase)
  async forceSync() {
    console.log('🔄 SyncService: Starting force sync...');
    try {
      this.notifyListeners({
        type: 'sync_start',
        message: 'Forcing full sync...'
      });

      const result = await supabaseClient.forceSync();

      await this.setLastSyncTime();

      this.notifyListeners({
        type: 'sync_complete',
        message: 'Force sync completed'
      });

      return {
        success: true,
        message: 'Force sync completed successfully',
        data: result
      };
    } catch (error) {
      console.error('🔄 SyncService: Force sync error:', error);
      this.notifyListeners({
        type: 'sync_error',
        message: error.message
      });
      return { success: false, message: error.message };
    }
  }

  // Check if sync is needed (uses supabaseClient's built-in logic)

  // Auto sync (called on app start) - uses smart caching
  async autoSync() {
    console.log('🔄 SyncService: Starting auto sync...');

    const isOnline = await this.checkConnectivity();
    console.log('🔄 SyncService: Online status:', isOnline);
    if (!isOnline) {
      console.log('🔄 SyncService: Offline mode');
      this.notifyListeners({
        type: 'sync_error',
        message: 'Offline mode - using cached data'
      });
      return { success: false, message: 'Offline mode' };
    }


    console.log('🔄 SyncService: Starting smart sync...');
    return await this.initialSync();
  }

  // Manual refresh - forces sync with fresh data
  async manualRefresh() {
    console.log('🔄 SyncService: Starting manual refresh...');
    return await this.initialSync(true); // Force parameter forces fresh sync
  }

  // Manual sync (for compatibility with existing code)
  async manualSync() {
    console.log('🔄 SyncService: Manual sync requested...');
    return await this.manualRefresh();
  }

  // Get cached data (uses supabaseClient cache)
  async getCachedData() {
    try {
      const [categories, stories] = await Promise.all([
        supabaseClient.getCachedCategories(),
        supabaseClient.getCachedStories()
      ]);

      return { categories, stories };
    } catch (error) {
      console.error('Error getting cached data:', error);
      return { categories: [], stories: [] };
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
    };
  }

  // Get database stats
  async getDatabaseStats() {
    return await supabaseClient.getDatabaseStats();
  }
}

export default new SyncService();