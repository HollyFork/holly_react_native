import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

type Orientation = 'PORTRAIT' | 'LANDSCAPE';

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>(
    Dimensions.get('window').width > Dimensions.get('window').height ? 'LANDSCAPE' : 'PORTRAIT'
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setOrientation(window.width > window.height ? 'LANDSCAPE' : 'PORTRAIT');
    });

    return () => subscription.remove();
  }, []);

  return orientation;
} 