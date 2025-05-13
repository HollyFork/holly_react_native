// import React, { useEffect } from 'react';
// import { router } from 'expo-router';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import { ThemedView } from '@/components/ThemedView';
// import { ThemedText } from '@/components/ThemedText';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { Colors } from '@/constants/Colors';

// export default function DashboardScreen() {
//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

//   // Rediriger automatiquement vers le dashboard dans les onglets
//   useEffect(() => {
//     router.replace('/(tabs)/dashboard');
//   }, []);

//   // Afficher un écran de chargement pendant la redirection
//   return (
//     <ThemedView style={styles.container}>
//       <ActivityIndicator size="large" color={colors.primary} />
//       <ThemedText style={styles.text}>Chargement...</ThemedText>
//     </ThemedView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   text: {
//     marginTop: 20,
//   }
// }); 