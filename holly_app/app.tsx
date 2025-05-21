import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Doit correspondre au nom du dossier contenant les routes
export const Root = () => {
  return <ExpoRoot context={require.context('./src/app')} />;
};

registerRootComponent(Root); 