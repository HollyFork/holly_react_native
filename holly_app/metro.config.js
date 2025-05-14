const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Obtenez la configuration de base d'Expo
const config = getDefaultConfig(__dirname);

// Ajoutez la résolution des alias
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
  '@/components': path.resolve(__dirname, 'components'),
  '@/constants': path.resolve(__dirname, 'constants'),
  '@/contexts': path.resolve(__dirname, 'contexts'),
  '@/hooks': path.resolve(__dirname, 'hooks'),
  '@/assets': path.resolve(__dirname, 'assets'),
};

module.exports = config; 