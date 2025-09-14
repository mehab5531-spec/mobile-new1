const { getDefaultConfig } = require('expo/metro-config');
// const path = require('node:path');
// const fs = require('node:fs');
// const { FileStore } = require('metro-cache');
// const { reportErrorToRemote } = require('./__create/report-error-to-remote');



// const cacheDir = path.join(__dirname, 'caches');

// config.cacheStores = () => [
//   new FileStore({
//     root: path.join(cacheDir, '.metro-cache'),
//   }),
// ];
// config.resetCache = false;
// config.fileMapCacheDirectory = cacheDir;
// config.reporter = {
//   ...config.reporter,
//   update: (event) => {
//     config.reporter?.update(event);
//     const reportableErrors = [
//       'error',
//       'bundling_error',
//       'cache_read_error',
//       'hmr_client_error',
//       'transformer_load_failed',
//     ];
//     for (const errorType of reportableErrors) {
//       if (event.type === errorType) {
//         reportErrorToRemote({ error: event.error }).catch((reportError) => {
//           // no-op
//         });
//       }
//     }
//     return event;
//   },
// };



/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
//   // Enable CSS support for web
//   isCSSEnabled: true,
});

// // Performance optimizations
// config.resolver.assetExts.push(
//   // Add support for additional asset types
//   'bin', 'txt', 'jpg', 'png', 'json', 'webp'
// );

// // Optimize for faster builds
// config.transformer = {
//   ...config.transformer,
//   minifierConfig: {
//     mangle: {
//       keep_fnames: true,
//     },
//   },
//   // Enable faster JavaScript transformations
//   unstable_allowRequireContext: true,
// };

// // Memory optimization for large projects
// config.maxWorkers = Math.max(1, Math.floor(require('os').cpus().length / 2));

// // Cache optimization
// config.resolver.platforms = ['ios', 'android'];

// // Source map optimization for debugging
// if (process.env.NODE_ENV === 'development') {
//   config.serializer = {
//     ...config.serializer,
//     createModuleIdFactory: () => (path) => {
//       // Use shorter module IDs in development
//       return path.substr(path.lastIndexOf('/') + 1);
//     },
//   };
// }

module.exports = config;
