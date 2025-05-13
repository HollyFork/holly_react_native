import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <IconSymbol
          size={60}
          name="fork.knife"
          color="#808080"
          style={styles.headerIcon}
        />
        <ThemedText type="title">Bienvenue !</ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Vos Réservations</ThemedText>
          <ThemedText>
            Consultez et gérez vos réservations en cours.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Restaurants Favoris</ThemedText>
          <ThemedText>
            Accédez rapidement à vos restaurants préférés.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Nouveautés</ThemedText>
          <ThemedText>
            Découvrez les nouveaux restaurants et promotions.
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
