import { ThemedText } from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { StyleSheet, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol
          size={60}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerIcon}
        />
        <ThemedText type="title">Explorer</ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Restaurants</ThemedText>
          <ThemedText>
            Découvrez les meilleurs restaurants de votre région.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Réservations</ThemedText>
          <ThemedText>
            Réservez facilement votre table en quelques clics.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Gestion</ThemedText>
          <ThemedText>
            Gérez vos réservations et vos préférences.
          </ThemedText>
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 60,
  },
  headerIcon: {
    marginRight: 15,
  },
  content: {
    gap: 20,
  },
  section: {
    padding: 15,
    borderRadius: 10,
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
