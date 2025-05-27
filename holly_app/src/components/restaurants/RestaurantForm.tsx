import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { Restaurant } from '@/models/Restaurant';
import { restaurantService } from '@/services/entities/restaurantService';
import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { ThemedText } from '../common/ThemedText';

interface RestaurantFormProps {
  restaurant?: Restaurant;
  onClose: () => void;
  mode: 'create' | 'edit';
}

type RestaurantFormData = Omit<Restaurant, 'id_restaurant'>;

export function RestaurantForm({ restaurant, onClose, mode }: RestaurantFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { refreshRestaurants } = useRestaurants();

  const [formData, setFormData] = useState<RestaurantFormData>({
    nom_restaurant: restaurant?.nom_restaurant || '',
    adresse_restaurant: restaurant?.adresse_restaurant || '',
    code_postal: restaurant?.code_postal || '',
    ville: restaurant?.ville || '',
    numero_telephone: restaurant?.numero_telephone || '',
    numero_siret: restaurant?.numero_siret || '',
    code_naf: restaurant?.code_naf || '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.nom_restaurant.trim()) {
      Alert.alert('Erreur', 'Le nom du restaurant est obligatoire');
      return;
    }

    if (!formData.numero_siret.trim()) {
      Alert.alert('Erreur', 'Le numéro SIRET est obligatoire');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'create') {
        await restaurantService.create(formData);
        Alert.alert('Succès', 'Restaurant créé avec succès');
      } else if (mode === 'edit' && restaurant) {
        await restaurantService.update(restaurant.id_restaurant, formData);
        Alert.alert('Succès', 'Restaurant mis à jour avec succès');
      }
      await refreshRestaurants();
      onClose();
    } catch (error) {
      Alert.alert(
        'Erreur',
        `Une erreur est survenue lors de ${mode === 'create' ? 'la création' : 'la mise à jour'} du restaurant`
      );
      console.error('Erreur RestaurantForm:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedText type="subtitle" style={styles.title}>
        {mode === 'create' ? 'Nouveau Restaurant' : 'Modifier Restaurant'}
      </ThemedText>

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
        placeholder="Nom du restaurant"
        placeholderTextColor={colors.text + '80'}
        value={formData.nom_restaurant}
        onChangeText={(text) => setFormData(prev => ({ ...prev, nom_restaurant: text }))}
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
        placeholder="Adresse"
        placeholderTextColor={colors.text + '80'}
        value={formData.adresse_restaurant}
        onChangeText={(text) => setFormData(prev => ({ ...prev, adresse_restaurant: text }))}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput, { backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Code postal"
          placeholderTextColor={colors.text + '80'}
          value={formData.code_postal}
          onChangeText={(text) => setFormData(prev => ({ ...prev, code_postal: text }))}
          keyboardType="numeric"
        />

        <TextInput
          style={[styles.input, styles.halfInput, { backgroundColor: colors.surface, color: colors.text }]}
          placeholder="Ville"
          placeholderTextColor={colors.text + '80'}
          value={formData.ville}
          onChangeText={(text) => setFormData(prev => ({ ...prev, ville: text }))}
        />
      </View>

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
        placeholder="Numéro de téléphone"
        placeholderTextColor={colors.text + '80'}
        value={formData.numero_telephone}
        onChangeText={(text) => setFormData(prev => ({ ...prev, numero_telephone: text }))}
        keyboardType="phone-pad"
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
        placeholder="Numéro SIRET"
        placeholderTextColor={colors.text + '80'}
        value={formData.numero_siret}
        onChangeText={(text) => setFormData(prev => ({ ...prev, numero_siret: text }))}
        keyboardType="numeric"
      />

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
        placeholder="Code NAF (optionnel)"
        placeholderTextColor={colors.text + '80'}
        value={formData.code_naf}
        onChangeText={(text) => setFormData(prev => ({ ...prev, code_naf: text }))}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: colors.primary }]}
          onPress={onClose}
          disabled={loading}
        >
          <ThemedText style={{ color: colors.primary }}>Annuler</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <ThemedText style={{ color: colors.surface }}>
            {loading ? 'Chargement...' : mode === 'create' ? 'Créer' : 'Mettre à jour'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    borderWidth: 0,
  },
}); 