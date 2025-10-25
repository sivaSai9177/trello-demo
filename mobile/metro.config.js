const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add .mjs and .mts extension support for @orpc/client
config.resolver.sourceExts.push('mjs', 'mts');

// Custom resolver to handle all @orpc packages (ES modules with .mjs)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Map all @orpc packages to their .mjs files
  const orpcPackages = {
    '@orpc/client': 'node_modules/@orpc/client/dist/index.mjs',
    '@orpc/client/fetch': 'node_modules/@orpc/client/dist/adapters/fetch/index.mjs',
    '@orpc/client/dist/adapters/fetch': 'node_modules/@orpc/client/dist/adapters/fetch/index.mjs',
    '@orpc/shared': 'node_modules/@orpc/shared/dist/index.mjs',
    '@orpc/standard-server': 'node_modules/@orpc/standard-server/dist/index.mjs',
    '@orpc/standard-server-fetch': 'node_modules/@orpc/standard-server-fetch/dist/index.mjs',
    '@orpc/standard-server-peer': 'node_modules/@orpc/standard-server-peer/dist/index.mjs',
  };

  if (orpcPackages[moduleName]) {
    return {
      filePath: path.join(__dirname, orpcPackages[moduleName]),
      type: 'sourceFile',
    };
  }

  // Default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config);
