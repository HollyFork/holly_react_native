import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HeaderWithSidebars } from '@/components/HeaderWithSidebars';
import { CustomIcon } from '@/components/CustomIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useReservations } from '@/hooks/useReservations';
import { router } from 'expo-router';

// Données factices pour le tableau de bord
const mockData = {
  reservations: {
    total: 28,
    today: 12,
    upcoming: 16,
    detailsToday: [
      { id: 1, client: 'Martin Dupont', heure: '12:30', personnes: 4, telephone: '0612345678', salle: 'Principale' },
      { id: 2, client: 'Sophie Bernard', heure: '13:00', personnes: 2, telephone: '0698765432', salle: 'Terrasse' },
      { id: 3, client: 'Jean Moreau', heure: '19:30', personnes: 6, telephone: '0687654321', salle: 'Principale' },
      { id: 4, client: 'Emma Laurent', heure: '20:00', personnes: 3, telephone: '0654321987', salle: 'VIP' },
    ]
  },
  commandes: {
    total: 34,
    enCours: 4,
    validees: 27,
    annulees: 3,
    chiffreJour: 1250.80,
    chiffreSemaine: 8750.25
  },
  stocks: {
    alertes: 5,
    ingredients: [
      { id: 1, nom: 'Farine', quantite: 2.5, unite: 'kg', seuil: 5 },
      { id: 2, nom: 'Huile d\'olive', quantite: 0.8, unite: 'L', seuil: 2 },
      { id: 3, nom: 'Tomates', quantite: 1.2, unite: 'kg', seuil: 3 },
      { id: 4, nom: 'Mozzarella', quantite: 0.5, unite: 'kg', seuil: 1 },
      { id: 5, nom: 'Thon', quantite: 0.4, unite: 'kg', seuil: 1 },
    ]
  },
  employes: {
    total: 12,
    presents: 8,
    absents: 4,
    typesRepartition: [
      { type: 'Serveur', nombre: 5 },
      { type: 'Cuisinier', nombre: 4 },
      { type: 'Manager', nombre: 1 },
      { type: 'Barman', nombre: 2 }
    ]
  },
  notes: [
    { id: 1, message: 'Vérifier l\'arrivage de vin pour demain', auteur: 'Marc (Manager)', date: '10:30' },
    { id: 2, message: 'Prévoir plus de personnel pour samedi soir', auteur: 'Emma (Manager)', date: '11:45' },
    { id: 3, message: 'Problème avec la chambre froide', auteur: 'Julie (Chef)', date: '14:20' }
  ]
};

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  onPress?: () => void;
}

function DashboardCard({ title, value, icon, color, onPress }: DashboardCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const cardColor = color || colors.primary;

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        colorScheme === 'dark' ? { backgroundColor: colors.background } : { backgroundColor: '#FFFFFF' },
        { borderColor: `${cardColor}10` }
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.cardIconCircle, { backgroundColor: cardColor }]}>
        <CustomIcon name={icon as any} size={18} color="#fff" />
      </View>
      <View style={styles.cardContent}>
        <ThemedText style={styles.cardTitle}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.cardValue, { color: cardColor }]} numberOfLines={1} ellipsizeMode="tail">
          {value}
        </ThemedText>
      </View>
      <View style={styles.cardArrow}>
        <CustomIcon name="chevron-right" size={16} color={colors.icon} />
      </View>
    </TouchableOpacity>
  );
}

interface DashboardCardV2Props {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  onPress?: () => void;
}

function DashboardCardV2({ icon, title, value, subtitle, onPress }: DashboardCardV2Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  return (
    <TouchableOpacity
      style={stylesV2.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={stylesV2.headerRow}>
        <CustomIcon name={icon as any} size={22} color={colors.primary} style={{ marginRight: 8 }} />
        <ThemedText style={stylesV2.cardTitle} numberOfLines={1} ellipsizeMode="tail">{title}</ThemedText>
        <View style={stylesV2.chevronContainer}>
          <CustomIcon name="chevron-right" size={20} color={colors.primary} />
        </View>
      </View>
      <View style={stylesV2.separator} />
      <View style={stylesV2.valueContainer}>
        <ThemedText
          style={stylesV2.value}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {value}
        </ThemedText>
        {subtitle && <ThemedText style={stylesV2.subtitle}>{subtitle}</ThemedText>}
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const { 
    selectedRestaurant,
    loading: restaurantsLoading,
    error: restaurantsError,
    refreshRestaurants
  } = useRestaurants();

  const {
    loading: reservationsLoading,
    error: reservationsError,
    getFutureReservations,
    refreshReservations
  } = useReservations(selectedRestaurant?.id_restaurant || null);

  if (restaurantsLoading || reservationsLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>Chargement des données...</ThemedText>
      </ThemedView>
    );
  }

  if (restaurantsError || reservationsError || !selectedRestaurant) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <CustomIcon name="alert-circle" size={40} color={colors.error} />
        <ThemedText style={styles.errorText}>
          {restaurantsError || reservationsError || "Aucun restaurant disponible"}
        </ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            refreshRestaurants();
            refreshReservations();
          }}
        >
          <ThemedText style={styles.retryText}>Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const futureReservations = getFutureReservations();

  return (
    <ThemedView style={styles.container}>
      <HeaderWithSidebars restaurantName={selectedRestaurant.nom_restaurant} />
      
      {/* Contenu principal */}
      <ScrollView 
        style={stylesV2.content}
        contentContainerStyle={stylesV2.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={stylesV2.titleContainer}>
          <ThemedText type="title" style={stylesV2.mainTitle}>
            Tableau de bord
          </ThemedText>
          <TouchableOpacity 
            onPress={() => {
              refreshRestaurants();
              refreshReservations();
            }} 
            style={stylesV2.refreshButton}
          >
            <CustomIcon name="refresh" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <DashboardCardV2
          icon="event"
          title={"Réservations aujourd'hui"}
          value={futureReservations.length.toString()}
          subtitle={futureReservations.length === 1 ? 'réservation' : 'réservations'}
          onPress={() => router.push('/(tabs)/reservations')}
        />
        <DashboardCardV2
          icon="shopping_bag"
          title="Commandes"
          value={"6"}
          subtitle={"Commandes en cours : 1"}
        />
        <DashboardCardV2
          icon="schedule"
          title="Heures de pointe"
          value={"12h-14h, 19h-21h"}
        />
        <DashboardCardV2
          icon="fridge-outline"
          title="Stocks critiques"
          value={""}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F27E42',
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    height: 96,
    marginBottom: 16,
    padding: 14,
    paddingTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(242, 126, 66, 0.1)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
    alignSelf: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 5,
    height: '100%',
    paddingTop: 10,
  },
  cardTitle: {
    fontSize: 12,
    color: '#888',
    fontWeight: '400',
    marginBottom: 4,
    marginTop: 0,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    lineHeight: 26,
  },
  cardValueUnit: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 2,
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 11,
    opacity: 0.6,
    lineHeight: 14,
  },
  cardArrow: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const stylesV2 = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#F6F5F8',
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 8,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'nowrap',
    minHeight: 28,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  chevronContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginBottom: 12,
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    marginTop: 2,
    marginBottom: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F27E42',
    marginBottom: 2,
    textAlign: 'center',
    flexShrink: 1,
    width: '100%',
  },
  subtitle: {
    fontSize: 15,
    color: '#A0A0A0',
    marginTop: 6,
    textAlign: 'center',
  },
}); 