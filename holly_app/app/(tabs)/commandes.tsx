import React, { useState, useMemo } from 'react';
import { View, FlatList, RefreshControl, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useCommandes } from '@/hooks/useCommandes';
import { Colors } from '@/constants/Colors';
import { CustomIcon } from '@/components/CustomIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Commande } from '@/src/models';
import { HeaderWithSidebars } from '@/components/HeaderWithSidebars';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { router } from 'expo-router';

const FILTERS = [
  { key: 'TOUS', label: 'Toutes' },
  { key: 'EN_COURS', label: 'En cours' },
  { key: 'VALIDEE', label: 'Validées' },
  { key: 'ANNULEE', label: 'Annulées' },
];

function filterCommandes(commandes: Commande[], filter: string): Commande[] {
  if (filter === 'TOUS') return commandes;
  return commandes.filter(cmd => cmd.statut === filter);
}

export default function CommandesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { selectedRestaurant } = useRestaurants();
  const { commandes, loading, refreshCommandes } = useCommandes(selectedRestaurant?.id_restaurant || null);
  const [filter, setFilter] = useState('TOUS');

  const filtered = useMemo(() => filterCommandes(commandes, filter), [commandes, filter]);

  // Statistiques
  const total = commandes.length;
  const enCours = commandes.filter(cmd => cmd.statut === 'EN_COURS').length;
  const validees = commandes.filter(cmd => cmd.statut === 'VALIDEE').length;

  const getFilterStyle = (filterKey: string) => {
    switch (filterKey) {
      case 'EN_COURS':
        return { backgroundColor: '#fff7e6', borderColor: colors.primary };
      case 'VALIDEE':
        return { backgroundColor: '#e6f0ff', borderColor: '#3b82f6' };
      case 'ANNULEE':
        return { backgroundColor: '#f5f5f5', borderColor: '#888' };
      default:
        return { backgroundColor: '#eee', borderColor: '#ccc' };
    }
  };

  const getFilterTextStyle = (filterKey: string) => {
    switch (filterKey) {
      case 'EN_COURS':
        return { color: colors.primary };
      case 'VALIDEE':
        return { color: '#3b82f6' };
      case 'ANNULEE':
        return { color: '#666' };
      default:
        return { color: colors.text };
    }
  };

  const getCommandeCardStyle = (statut: Commande['statut']) => {
    switch (statut) {
      case 'EN_COURS':
        return { backgroundColor: '#fff7e6', borderLeftColor: colors.primary };
      case 'VALIDEE':
        return { backgroundColor: '#e6f0ff', borderLeftColor: '#3b82f6' };
      case 'ANNULEE':
        return { backgroundColor: '#f5f5f5', borderLeftColor: '#888' };
      default:
        return { backgroundColor: '#fff', borderLeftColor: '#ccc' };
    }
  };

  const handleCommandePress = (commandeId: number) => {
    router.push({
      pathname: "/commande/[commandeId]",
      params: { commandeId }
    });
  };

  if (!selectedRestaurant) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Aucun restaurant sélectionné</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des données...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderWithSidebars restaurantName={selectedRestaurant.nom_restaurant} />
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {FILTERS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              style={[
                styles.tab,
                getFilterStyle(tab.key),
                filter === tab.key && { borderWidth: 2 }
              ]}
            >
              <Text style={[
                styles.tabText,
                getFilterTextStyle(tab.key),
                filter === tab.key && { fontWeight: 'bold' }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={refreshCommandes} style={styles.refreshBtn}>
          <CustomIcon 
            name="refresh" 
            size={24} 
            color={colors.primary} 
            style={loading ? { transform: [{ rotate: '360deg' }] } : undefined}
          />
        </TouchableOpacity>
      </View>
      {/* Statistiques */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#f0f1f2' }]}> 
          <Text style={styles.statValue}>{total}</Text>
          <Text style={[styles.statLabel, { fontWeight: '800' }]}>Total</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fff7e6' }]}> 
          <Text style={[styles.statValue, { color: colors.primary }]}>{enCours}</Text>
          <Text style={[styles.statLabel, { color: colors.primary }]}>En cours</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#e6f0ff' }]}> 
          <Text style={[styles.statValue, { color: '#3b82f6' }]}>{validees}</Text>
          <Text style={[styles.statLabel, { color: '#3b82f6' }]}>Validées</Text>
        </View>
      </View>
      {/* Liste des commandes */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 10, paddingBottom: 30 }}
        renderItem={({ item }: { item: Commande }) => {
          const date = new Date(item.created_at);
          const formattedDate = format(date, 'dd MMM yyyy HH:mm', { locale: fr });
          
          return (
            <TouchableOpacity 
              style={[
                styles.commandeCard,
                getCommandeCardStyle(item.statut)
              ]}
              onPress={() => handleCommandePress(item.id)}
            >
              <CustomIcon name="cart" size={32} color={colors.icon} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.commandeId}>Commande #{item.id}</Text>
                  <CustomIcon name="chevron-right" size={24} color={colors.icon} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <CustomIcon name="clock-time-four" size={16} color={colors.icon} />
                  <Text style={styles.commandeDate}>{formattedDate}</Text>
                  <CustomIcon name="currency-eur" size={16} color={colors.icon} style={{ marginLeft: 10 }} />
                  <Text style={styles.commandeMontant}>{Number(item.montant).toFixed(2)} €</Text>
                  {item.table && (
                    <>
                      <CustomIcon name="silverware-fork-knife" size={16} color={colors.icon} style={{ marginLeft: 10 }} />
                      <Text style={styles.commandeTable}>Table {item.table.numero}</Text>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.icon, marginTop: 40 }}>Aucune commande</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
  },
  refreshBtn: {
    marginLeft: 'auto',
    padding: 6,
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    padding: 6,
    marginHorizontal: 1,
    gap: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  statValue: {
    fontWeight: '700',
    fontSize: 16,
  },
  commandeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    borderLeftWidth: 4,
    backgroundColor: '#fff',
  },
  commandeId: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  commandeDate: {
    color: '#888',
    fontSize: 13,
    marginLeft: 4,
  },
  commandeMontant: {
    color: '#888',
    fontSize: 13,
    marginLeft: 4,
  },
  commandeTable: {
    color: '#888',
    fontSize: 13,
    marginLeft: 4,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
}); 