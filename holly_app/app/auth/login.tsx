import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
// @ts-ignore - Contourne les problèmes de typage avec LinearGradient
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router, usePathname } from 'expo-router';
import BackgroundPattern from '../../components/BackgroundPattern';
import BackgroundIcons from '../../components/BackgroundIcons';
import RestaurantIcon from '../../components/RestaurantIcon';
import AnimatedInput from '../../components/AnimatedInput';
import { useThemeColor } from '../../hooks/useThemeColor';
import { authService } from '../../src/services/auth/authService';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirectionAttempted, setRedirectionAttempted] = useState(false);
  
  const { colors, isDark, gradientColors } = useThemeColor();
  const pathname = usePathname();
  
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        // Forcer le mode portrait immédiatement
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch (error) {
        console.error('Erreur lors du verrouillage de l\'orientation:', error);
      }
    };

    lockOrientation();

    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      // Éviter les vérifications multiples si une redirection a déjà été tentée
      if (redirectionAttempted) return;
      
      try {
        if (await authService.isAuthenticated()) {
          // Obtenir les informations actuelles de l'utilisateur
          const userData = await authService.getCurrentUser();
          
          // Ne rediriger que si on a des données utilisateur valides
          if (userData && userData.id) {
            console.log('Utilisateur déjà connecté, redirection vers dashboard');
            setRedirectionAttempted(true);
            setTimeout(() => redirectToDashboard(userData), 100);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification d\'authentification:', error);
      }
    };
    
    checkAuth();

    // Restaurer l'orientation par défaut lors du démontage
    return () => {
      ScreenOrientation.unlockAsync().catch(error => {
        console.error('Erreur lors du déverrouillage de l\'orientation:', error);
      });
    };
  }, [redirectionAttempted]);
  
  const redirectToDashboard = (userData: any) => {
    // Vérifier que les données utilisateur sont valides
    if (!userData || !userData.id) {
      console.error('Données utilisateur invalides pour la redirection', userData);
      return;
    }
    
    // S'assurer que nous sommes toujours sur la page de login avant de rediriger
    if (pathname.includes('/auth/login')) {
      console.log('Redirection vers le dashboard');
      router.replace({
        pathname: '/dashboard',
        params: { user: JSON.stringify(userData) }
      });
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await authService.login({ 
        username: username.trim(), 
        password: password.trim() 
      });
      
      // Accédez aux données de la réponse correctement
      if (response && response.data) {
        // Vérifier que la réponse contient un ID utilisateur valide
        if (!response.data.id_user && typeof response.data.id_user !== 'number') {
          console.error('Erreur: ID utilisateur manquant dans la réponse:', response.data);
          throw new Error('Données utilisateur incomplètes (ID manquant)');
        }
        
        // Assurer que l'objet utilisateur a la propriété id pour compatibilité avec le dashboard
        const userData = {
          ...response.data,
          id: response.data.id_user // Ajouter l'alias id pour la propriété id_user
        };
        
        console.log('Préparation des données utilisateur pour stockage:', userData);
        
        // Stocker les données utilisateur si nécessaire
        await authService.setUserData(userData, ''); // Pas de token, mais stockage des données utilisateur
        setRedirectionAttempted(true);
        redirectToDashboard(userData);
      } else {
        throw new Error('Réponse invalide du serveur');
      }
    } catch (error: any) {
      console.error('Erreur de login détaillée:', error);
      
      // Afficher des informations plus détaillées sur l'erreur
      let errorMessage = 'Une erreur inattendue est survenue';
      
      if (error.response) {
        // La requête a été effectuée et le serveur a répondu avec un code d'état
        console.error('Erreur de réponse:', error.response.status, error.response.data);
        errorMessage = error.response.data?.detail || 
                      error.response.data?.non_field_errors?.[0] || 
                      `Erreur ${error.response.status}: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // La requête a été effectuée mais aucune réponse n'a été reçue
        console.error('Erreur de requête:', error.request);
        errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion réseau.';
      } else if (error.message) {
        // Une erreur s'est produite lors de la configuration de la requête
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Erreur de connexion',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <BackgroundPattern count={12} />
      <BackgroundIcons count={6} />
      
      <View style={styles.contentContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <RestaurantIcon 
                size={isTablet ? 80 : 60}
                color="white"
                bgColor={colors.primary}
              />
            </View>
            <Text style={[styles.logoText, { color: colors.primary }]}>HollyFork</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <AnimatedInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? 'rgba(42, 42, 42, 0.8)' : 'rgba(245, 245, 245, 0.8)',
                  color: colors.text,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }
              ]}
              placeholder="Nom d'utilisateur"
              placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              bubbleColor={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
            />
            
            <AnimatedInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDark ? 'rgba(42, 42, 42, 0.8)' : 'rgba(245, 245, 245, 0.8)',
                  color: colors.text,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }
              ]}
              placeholder="Mot de passe"
              placeholderTextColor={isDark ? '#9BA1A6' : '#687076'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              bubbleColor={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
            />
            
            <TouchableOpacity
              style={[
                styles.button,
                { 
                  backgroundColor: colors.primary,
                  opacity: isLoading ? 0.7 : 1
                }
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Se connecter</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.versionText, { color: colors.icon }]}>
              Version 1.0
            </Text>
          </View>
        </KeyboardAvoidingView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: isTablet ? 120 : 100,
    height: isTablet ? 120 : 100,
    borderRadius: isTablet ? 60 : 50,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoText: {
    fontSize: isTablet ? 40 : 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    width: isTablet ? '60%' : '80%',
    maxWidth: 400,
    marginBottom: 30,
  },
  input: {
    height: isTablet ? 60 : 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: isTablet ? 18 : 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  button: {
    height: isTablet ? 60 : 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2.62,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
  },
}); 