import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { CustomIcon } from '@/components/CustomIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { usePathname } from 'expo-router';
import { useRestaurants } from '@/hooks/useRestaurants';
import { Restaurant } from '@/src/models';
// @ts-ignore - Contourne les problèmes de typage avec LinearGradient
import { LinearGradient } from 'expo-linear-gradient';

// Conversion de type pour la compatibilité avec le composant Sidebar
const convertToSidebarRestaurant = (restaurant: Restaurant) => {
  return {
    id: restaurant.id_restaurant.toString(),
    name: restaurant.nom_restaurant
  };
};

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
  subtitle?: string;
  icon: string;
  color?: string;
  onPress?: () => void;
}

function DashboardCard({ title, value, subtitle, icon, color, onPress }: DashboardCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { width: screenWidth } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 768;
  const cardWidth = isSmallScreen ? '100%' : '48%';
  const cardColor = color || colors.primary;

  return (
    <ThemedView style={[
      styles.card,
      { 
        width: cardWidth,
        marginBottom: 16
      }
    ]}>
      <View style={[styles.cardIconCircle, { backgroundColor: cardColor }]}>
        <CustomIcon name={icon as any} size={24} color="#fff" />
      </View>
      <View style={styles.cardBody}>
        <ThemedText style={styles.cardTitle}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.cardValue, { color: cardColor }]}>
          {value}
        </ThemedText>
        {subtitle && (
          <ThemedText style={styles.cardSubtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      <TouchableOpacity 
        style={styles.cardAction}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <CustomIcon name="chevron-right" size={20} color={colors.icon} />
      </TouchableOpacity>
    </ThemedView>
  );
}

function ReservationItem({ reservation, colorScheme }: { reservation: any, colorScheme: 'light' | 'dark' }) {
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  return (
    <View style={[styles.reservationItem, { borderBottomColor: `${colors.text}10` }]}>
      <View style={styles.reservationHeader}>
        <ThemedText style={styles.reservationClient}>{reservation.client}</ThemedText>
        <ThemedText style={[styles.reservationTag, { backgroundColor: `${colors.primary}15`, color: colors.primary }]}>
          {reservation.salle}
        </ThemedText>
      </View>
      <View style={styles.reservationDetails}>
        <View style={styles.reservationDetail}>
          <CustomIcon name="schedule" size={14} color={colors.icon} />
          <ThemedText style={styles.reservationDetailText}>{reservation.heure}</ThemedText>
        </View>
        <View style={styles.reservationDetail}>
          <CustomIcon name="people" size={14} color={colors.icon} />
          <ThemedText style={styles.reservationDetailText}>{reservation.personnes} pers.</ThemedText>
        </View>
        <View style={styles.reservationDetail}>
          <CustomIcon name="phone" size={14} color={colors.icon} />
          <ThemedText style={styles.reservationDetailText}>{reservation.telephone}</ThemedText>
        </View>
      </View>
    </View>
  );
}

function StockItem({ stock, colorScheme }: { stock: any, colorScheme: 'light' | 'dark' }) {
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const stockRatio = stock.quantite / stock.seuil;
  const stockColor = stockRatio <= 0.5 ? '#F44336' : stockRatio <= 0.75 ? '#FF9800' : '#4CAF50';
  
  return (
    <View style={[styles.stockItem, { borderBottomColor: `${colors.text}10` }]}>
      <View style={styles.stockInfo}>
        <ThemedText style={styles.stockName}>{stock.nom}</ThemedText>
        <ThemedText style={styles.stockQuantity}>
          {stock.quantite} {stock.unite} / {stock.seuil} {stock.unite}
        </ThemedText>
      </View>
      <View style={styles.stockBarContainer}>
        <View style={[styles.stockBarBg, { backgroundColor: `${colors.text}15` }]}>
          <View 
            style={[
              styles.stockBarFill, 
              { 
                backgroundColor: stockColor,
                width: `${Math.min(100, (stock.quantite / stock.seuil) * 100)}%` 
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

function NoteItem({ note, colorScheme }: { note: any, colorScheme: 'light' | 'dark' }) {
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  return (
    <View style={[styles.noteItem, { backgroundColor: `${colors.text}08` }]}>
      <View style={styles.noteHeader}>
        <ThemedText style={styles.noteAuthor}>{note.auteur}</ThemedText>
        <ThemedText style={styles.noteDate}>{note.date}</ThemedText>
      </View>
      <ThemedText style={styles.noteMessage}>{note.message}</ThemedText>
    </View>
  );
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const pathname = usePathname();
  
  // Utilisation du hook pour récupérer les restaurants
  const { 
    restaurants,
    loading,
    error,
    selectedRestaurant,
    setSelectedRestaurant,
    refreshRestaurants
  } = useRestaurants();
  
  // État pour gérer l'ouverture/fermeture de la sidebar et navbar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  
  // Conversion des restaurants pour le composant Sidebar
  const sidebarRestaurants = restaurants.map(convertToSidebarRestaurant);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isNavbarOpen) setIsNavbarOpen(false);
  };
  
  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
    if (isSidebarOpen) setIsSidebarOpen(false);
  };
  
  const handleRestaurantSelect = (sidebarRestaurant: { id: string; name: string }) => {
    const restaurant = restaurants.find(r => r.id_restaurant.toString() === sidebarRestaurant.id);
    if (restaurant) {
      setSelectedRestaurant(restaurant);
    }
    setIsSidebarOpen(false);
  };

  // Afficher un indicateur de chargement si les données sont en cours de récupération
  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>Chargement des restaurants...</ThemedText>
      </ThemedView>
    );
  }

  // Afficher un message d'erreur si nécessaire
  if (error || !selectedRestaurant) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <CustomIcon name="error" size={40} color={colors.error} />
        <ThemedText style={styles.errorText}>
          {error || "Aucun restaurant disponible"}
        </ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={refreshRestaurants}
        >
          <ThemedText style={styles.retryText}>Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header 
        restaurantName={selectedRestaurant.nom_restaurant}
        onSidebarToggle={toggleSidebar}
        onMenuToggle={toggleNavbar}
      />
      
      {/* Sidebar pour la liste des restaurants */}
      <Sidebar 
        isVisible={isSidebarOpen}
        restaurants={sidebarRestaurants}
        selectedRestaurantId={selectedRestaurant.id_restaurant.toString()}
        onRestaurantSelect={handleRestaurantSelect}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Navbar pour la navigation dans l'app */}
      <Navbar 
        isVisible={isNavbarOpen}
        onClose={() => setIsNavbarOpen(false)}
        currentRoute={pathname}
      />
      
      {/* Contenu principal */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.mainTitle}>
          Tableau de bord
        </ThemedText>
        
        {/* Aperçu rapide - Cards */}
        <View style={styles.cardsContainer}>
          <DashboardCard 
            title="Réservations" 
            value={mockData.reservations.today} 
            subtitle={`${mockData.reservations.upcoming} à venir`} 
            icon="event" 
            color="#4CAF50"
          />
          <DashboardCard 
            title="Commandes" 
            value={mockData.commandes.enCours} 
            subtitle={`${mockData.commandes.total} au total`} 
            icon="shopping_bag" 
            color="#2196F3"
          />
          <DashboardCard 
            title="CA Journalier" 
            value={`${mockData.commandes.chiffreJour.toFixed(2)} €`} 
            subtitle={`${mockData.commandes.chiffreSemaine.toFixed(2)} € cette semaine`} 
            icon="euro_symbol" 
            color="#673AB7"
          />
          <DashboardCard 
            title="Alertes Stock" 
            value={mockData.stocks.alertes} 
            subtitle="Ingrédients à commander" 
            icon="warning" 
            color="#FF9800"
          />
        </View>
        
        {/* Section Réservations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: "#4CAF50" }]}>
              <CustomIcon name="event" size={20} color="#fff" />
            </View>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Réservations du jour
            </ThemedText>
            <TouchableOpacity style={styles.sectionAction}>
              <CustomIcon name="chevron-right" size={18} color={colors.icon} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.reservationsContainer}>
            {mockData.reservations.detailsToday.length > 0 ? (
              mockData.reservations.detailsToday.map((reservation) => (
                <ReservationItem 
                  key={`reservation-${reservation.id}`} 
                  reservation={reservation} 
                  colorScheme={colorScheme === 'dark' ? 'dark' : 'light'} 
                />
              ))
            ) : (
              <ThemedText style={styles.emptyStateText}>Aucune réservation aujourd'hui</ThemedText>
            )}
          </View>
        </View>
        
        {/* Section Stock */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: "#FF9800" }]}>
              <CustomIcon name="warning" size={20} color="#fff" />
            </View>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Alertes de stock
            </ThemedText>
            <TouchableOpacity style={styles.sectionAction}>
              <CustomIcon name="chevron-right" size={18} color={colors.icon} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.stocksContainer}>
            {mockData.stocks.ingredients.map((stock) => (
              <StockItem 
                key={`stock-${stock.id}`} 
                stock={stock} 
                colorScheme={colorScheme === 'dark' ? 'dark' : 'light'} 
              />
            ))}
          </View>
        </View>
        
        {/* Section Personnel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: "#673AB7" }]}>
              <CustomIcon name="people" size={20} color="#fff" />
            </View>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Personnel
            </ThemedText>
            <TouchableOpacity style={styles.sectionAction}>
              <CustomIcon name="chevron-right" size={18} color={colors.icon} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <ThemedText style={styles.statLabel}>Employés présents:</ThemedText>
              <View style={styles.statValueContainer}>
                <ThemedText style={styles.statValue}>{mockData.employes.presents}/{mockData.employes.total}</ThemedText>
              </View>
            </View>
            <View style={styles.statsRow}>
              <ThemedText style={styles.statLabel}>Serveurs:</ThemedText>
              <View style={styles.statValueContainer}>
                <ThemedText style={styles.statValue}>{mockData.employes.typesRepartition.find(t => t.type === 'Serveur')?.nombre || 0}</ThemedText>
              </View>
            </View>
            <View style={styles.statsRow}>
              <ThemedText style={styles.statLabel}>Cuisiniers:</ThemedText>
              <View style={styles.statValueContainer}>
                <ThemedText style={styles.statValue}>{mockData.employes.typesRepartition.find(t => t.type === 'Cuisinier')?.nombre || 0}</ThemedText>
              </View>
            </View>
          </View>
        </View>
        
        {/* Section Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: "#2196F3" }]}>
              <CustomIcon name="note" size={20} color="#fff" />
            </View>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Notes de service
            </ThemedText>
            <TouchableOpacity style={styles.sectionAction}>
              <CustomIcon name="add" size={18} color={colors.icon} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.notesContainer}>
            {mockData.notes.map((note) => (
              <NoteItem 
                key={`note-${note.id}`} 
                note={note} 
                colorScheme={colorScheme === 'dark' ? 'dark' : 'light'} 
              />
            ))}
          </View>
        </View>
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
    padding: 20,
    paddingBottom: 32,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F27E42',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    flex: 1,
  },
  sectionAction: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    marginLeft: 16,
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  cardAction: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reservationsContainer: {
    marginTop: 10,
  },
  reservationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reservationClient: {
    fontSize: 16,
    fontWeight: '600',
  },
  reservationTag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  reservationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reservationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  reservationDetailText: {
    fontSize: 14,
    marginLeft: 4,
    opacity: 0.6,
  },
  stocksContainer: {
    marginTop: 10,
  },
  stockItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stockName: {
    fontSize: 15,
    fontWeight: '500',
  },
  stockQuantity: {
    fontSize: 14,
    opacity: 0.7,
  },
  stockBarContainer: {
    height: 8,
    marginTop: 6,
  },
  stockBarBg: {
    height: '100%',
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stockBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  notesContainer: {
    marginTop: 10,
    gap: 10,
  },
  noteItem: {
    padding: 12,
    borderRadius: 10,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noteAuthor: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  noteMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    paddingVertical: 20,
    opacity: 0.6,
  },
  highlight: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(242, 126, 66, 0.08)',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  highlightValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#F27E42',
  },
  highlightLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statBadge: {
    marginLeft: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  badgeContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 126, 66, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(242, 126, 66, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    color: '#F27E42',
    fontWeight: '600',
  },
}); 