import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
// @ts-ignore - Contourne les problèmes de typage avec LinearGradient
import AnimatedInput from '@/components/common/AnimatedInput';
import BackgroundIcons from '@/components/common/BackgroundIcons';
import BackgroundPattern from '@/components/common/BackgroundPattern';
import RestaurantIcon from '@/components/common/RestaurantIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localIsLoading, setLocalIsLoading] = useState(false);
  
  const { colors, isDark, gradientColors } = useThemeColor();
  const { login, isAuthenticated, isLoading: authIsLoading, user } = useAuth();
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

    // Gérer la redirection si l'utilisateur est déjà authentifié
    // authIsLoading est important ici pour attendre que l'état initial soit vérifié par AuthProvider
    if (!authIsLoading && isAuthenticated && user && user.id) {
      console.log('LoginScreen: Utilisateur déjà authentifié (via useAuth), redirection vers dashboard');
      // S'assurer que nous sommes toujours sur la page de login avant de rediriger
      if (pathname.includes('/auth/login')) {
        router.replace({
          pathname: '/(tabs)/dashboard',
          // Plus besoin de passer 'user' en params si RestaurantContext le gère via useAuth
        });
      }
    }

    // Restaurer l'orientation par défaut lors du démontage
    return () => {
      ScreenOrientation.unlockAsync().catch(error => {
        console.error('Erreur lors du déverrouillage de l\'orientation:', error);
      });
    };
  }, [isAuthenticated, authIsLoading, user, pathname]);
  
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    
    setLocalIsLoading(true);
    try {
      await login({
        username: username.trim(), 
        password: password.trim() 
      });
      console.log('Connexion réussie via AuthContext dans LoginScreen');
    } catch (error: any) {
      Alert.alert('Erreur de connexion', error.message || 'Identifiants incorrects ou problème serveur.');
      console.error('Erreur lors de handleLogin dans LoginScreen:', error);
    } finally {
      setLocalIsLoading(false);
    }
  };

  // Si AuthProvider est en train de vérifier l'état initial, afficher un chargement global
  // Cela évite un flash de l'écran de login si l'utilisateur est déjà connecté.
  if (authIsLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background}}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors as [string, string, string]}
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
              containerStyle={[
                styles.input,
                { 
                  backgroundColor: isDark ? 'rgba(42, 42, 42, 0.8)' : 'rgba(245, 245, 245, 0.8)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderWidth: 1,
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
              style={{ color: colors.text }}
            />
            
            <AnimatedInput
              containerStyle={[
                styles.input,
                { 
                  backgroundColor: isDark ? 'rgba(42, 42, 42, 0.8)' : 'rgba(245, 245, 245, 0.8)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderWidth: 1,
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
              style={{ color: colors.text }}
            />
            
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                (localIsLoading || authIsLoading) && styles.buttonDisabled
              ]}
              onPress={handleLogin}
              disabled={localIsLoading || authIsLoading}
            >
              {(localIsLoading || authIsLoading) ? (
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
    width: isTablet ? '45%' : '70%',
    maxWidth: 350,
    marginBottom: 30,
    gap: 16,
    alignItems: 'center',
  },
  input: {
    height: isTablet ? 60 : 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: isTablet ? 18 : 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    width: '100%',
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
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
    opacity: 0.7,
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