import { Colors } from '@/constants/Colors';
import { Restaurant } from '@/models/Restaurant';
import React from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { ThemedText } from '../common/ThemedText';
import { RestaurantForm } from './RestaurantForm';

interface RestaurantModalProps {
  visible: boolean;
  onClose: () => void;
  restaurant?: Restaurant;
  mode: 'create' | 'edit';
}

const { width } = Dimensions.get('window');
const MODAL_WIDTH = Math.min(500, width * 0.9);

export function RestaurantModal({ visible, onClose, restaurant, mode }: RestaurantModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              {mode === 'create' ? 'Nouveau Restaurant' : 'Modifier Restaurant'}
            </ThemedText>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <ThemedText style={{ color: colors.text }}>×</ThemedText>
            </TouchableOpacity>
          </View>

          <RestaurantForm
            restaurant={restaurant}
            onClose={onClose}
            mode={mode}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: MODAL_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 