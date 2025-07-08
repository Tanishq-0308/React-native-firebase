// ================================
// COMPLETE FIREBASE AUTH APP SETUP FOR ANDROID
// ================================

// 1. INSTALLATION COMMANDS
// Run these commands in your project root:
/*
npm install firebase
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
cd android && ./gradlew clean && cd ..
npx react-native run-android
*/

// ================================
// 2. ANDROID CONFIGURATION FILES
// ================================

// android/build.gradle (Project level)
/*
buildscript {
    ext {
        buildToolsVersion = "33.0.0"
        minSdkVersion = 21
        compileSdkVersion = 33
        targetSdkVersion = 33
        ndkVersion = "23.1.7779620"
    }
    dependencies {
        classpath("com.android.tools.build:gradle:7.3.1")
        classpath("com.facebook.react:react-native-gradle-plugin")
        // Add this line for Firebase
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
*/

// android/app/build.gradle (App level)
/*
apply plugin: "com.android.application"
apply plugin: "com.facebook.react"
// Add this line for Firebase
apply plugin: 'com.google.gms.google-services'

android {
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.firebaseauthapp"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        multiDexEnabled true
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation "com.facebook.react:react-native:+"
    implementation "androidx.swiperefreshlayout:swiperefreshlayout:1.0.0"
    implementation platform('com.google.firebase:firebase-bom:31.2.0')
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.firebase:firebase-analytics'
    
    if (enableHermes) {
        debugImplementation files(new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim(), "../ReactAndroid/hermes-engine/debug/hermes-engine-debug.aar"))
        releaseImplementation files(new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim(), "../ReactAndroid/hermes-engine/release/hermes-engine-release.aar"))
    } else {
        implementation jscFlavor
    }
}
*/

// ================================
// 3. FIREBASE CONFIGURATION
// ================================

// src/config/firebase.config.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;

// ================================
// 4. AUTHENTICATION SERVICE
// ================================

// src/services/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase.config';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const authService = {
  // Sign up with email and password
  signUp: async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name if provided
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<AuthResult> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async (): Promise<AuthResult> => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Reset password
  resetPassword: async (email: string): Promise<AuthResult> => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Auth state change listener
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

// ================================
// 5. NAVIGATION TYPES
// ================================

// src/types/navigation.ts
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  ForgotPassword: undefined;
};

// ================================
// 6. LOGIN SCREEN
// ================================

// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { authService } from '../services/authService';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await authService.signIn(email.trim(), password);
    
    if (result.success) {
      navigation.navigate('Home');
    } else {
      Alert.alert('Login Failed', result.error || 'An error occurred');
    }
    setLoading(false);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#666"
              />
              
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

// ================================
// 7. SIGNUP SCREEN
// ================================

// src/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { authService } from '../services/authService';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

interface SignUpScreenProps {
  navigation: SignUpScreenNavigationProp;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const result = await authService.signUp(email.trim(), password, name.trim());
    
    if (result.success) {
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } else {
      Alert.alert('Sign Up Failed', result.error || 'An error occurred');
    }
    setLoading(false);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholderTextColor="#666"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#666"
              />
              
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.passwordToggleText}>
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

// ================================
// 8. FORGOT PASSWORD SCREEN
// ================================

// src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { authService } from '../services/authService';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    const result = await authService.resetPassword(email.trim());
    
    if (result.success) {
      Alert.alert(
        'Success',
        'Password reset email sent! Check your inbox.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to send reset email');
    }
    setLoading(false);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive reset instructions</Text>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#666"
          />
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Email</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

// ================================
// 9. HOME SCREEN
// ================================

// src/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { authService } from '../services/authService';
import { User } from 'firebase/auth';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await authService.signOut();
            if (result.success) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome!</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.userCard}>
            <Text style={styles.welcomeText}>Hello, {user?.displayName || 'User'}!</Text>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Account Created:</Text>
              <Text style={styles.value}>
                {user?.metadata.creationTime ? 
                  new Date(user.metadata.creationTime).toLocaleDateString() : 
                  'N/A'
                }
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.label}>Last Sign In:</Text>
              <Text style={styles.value}>
                {user?.metadata.lastSignInTime ? 
                  new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                  'N/A'
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.featuresCard}>
            <Text style={styles.cardTitle}>App Features</Text>
            <Text style={styles.featureText}>✓ Secure Authentication</Text>
            <Text style={styles.featureText}>✓ Password Reset</Text>
            <Text style={styles.featureText}>✓ User Profile Management</Text>
            <Text style={styles.featureText}>✓ Session Persistence</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

// ================================
// 10. MAIN APP COMPONENT
// ================================

// App.tsx
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authService } from './src/services/authService';
import { User } from 'firebase/auth';
import { RootStackParamList } from './src/types/navigation';

import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={user ? 'Home' : 'Login'}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});

export default App;

// ================================
// 11. SHARED STYLES
// ================================

const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordToggle: {
    paddingHorizontal: 16,
  },
  passwordToggleText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Home Screen Styles
  headerContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  featuresCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    paddingLeft: 8,
  },
});

// ================================
// 12. PACKAGE.JSON DEPENDENCIES
// ================================

/*
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6",
    "firebase": "^9.23.0",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/native-stack": "^6.9.13",
    "react-native-screens": "^3.22.1",
    "react-native-safe-area-context": "^4.7.2",
    "@react-native-async-storage/async-storage": "^1.19.3"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "@react-native/eslint-config": "^0.72.2",
    "@react-native/metro-config": "^0.72.11",
    "@tsconfig/react-native": "^3.0.0",
    "@types/react": "^18.0.24",
    "@types/react-test-renderer": "^18.0.0",
    "babel-jest": "^29.2.1",
    "eslint": "^8.19.0",
    "jest": "^29.2.1",
    "metro-react-native-babel-preset": "0.76.8",
    "prettier": "^2.4.1",
    "react-test-renderer": "18.2.0",
    "typescript": "4.8.4"
  }
}
*/

// ================================
// 13. COMPLETE SETUP INSTRUCTIONS
// ================================

/*
STEP-BY-STEP SETUP FOR ANDROID:

1. CREATE FIREBASE PROJECT:
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Enter project name (e.g., "my-react-native-app")
   - Disable Google Analytics (optional)
   - Click "Create project"

2. ADD ANDROID APP TO FIREBASE:
   - In Firebase console, click "Add app" > Android icon
   - Enter Android package name (e.g., com.firebaseauthapp)
   - Enter App nickname (optional)
   - Click "Register app"

3. DOWNLOAD CONFIG FILE:
   - Download google-services.json
   - Place it in android/app/ directory of your React Native project

4. INSTALL DEPENDENCIES:
   npm install firebase
   npm install @react-navigation/native @react-navigation/native-stack
   npm install react-native-screens react-native-safe-area-context
   npm install @react-native-async-storage/async-storage

5. CONFIGURE ANDROID:
   - Update android/build.gradle (project level) - add Google services plugin
   - Update android/app/build.gradle (app level) - apply plugin and add dependencies
   - Run: cd android && ./gradlew clean && cd ..

6. ENABLE AUTHENTICATION IN FIREBASE:
   - Go to Firebase Console > Authentication
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider
   - Save changes

7. UPDATE FIREBASE CONFIG:
   - Copy your Firebase config from Firebase Console
   - Update src/config/firebase.config.ts with your config values

8. CREATE FOLDER STRUCTURE:
   src/
   ├── config/
   │   └── firebase.config.ts
   ├── services/
   │   └── authService.ts
   ├── screens/
   │   ├── LoginScreen.tsx
   │   ├── SignUpScreen.tsx
   │   ├── ForgotPasswordScreen.tsx
   │   └── HomeScreen.tsx
   ├── types/
   │   └── navigation.ts
   └── App.tsx

9. ANDROID PERMISSIONS (android/app/src/main/AndroidManifest.xml):
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

10. RUN THE APP:
    npx react-native run-android

TROUBLESHOOTING:

- If you get "Duplicate class" errors:
  cd android && ./gradlew clean && cd .. && npx react-native run-android

- If Firebase auth doesn't work:
  - Check google-services.json is in android/app/
  - Verify package name matches in Firebase console
  - Ensure internet permission is added

- If navigation doesn't work:
  - Make sure react-native-screens is properly linked
  - For React Native 0.60+, run: cd ios && pod install (if using iOS)

- If AsyncStorage errors:
  - Make sure @react-native-async-storage/async-storage is installed
  - Link it properly for your React Native version

ADDITIONAL FEATURES YOU CAN ADD:

1. Email Verification:
   - Use sendEmailVerification() from Firebase Auth
   - Check user.emailVerified before allowing access

2. Profile Picture Upload:
   - Add Firebase Storage
   - Upload images and update user profile

3. Google Sign-In:
   - Install @react-native-google-signin/google-signin
   - Configure Google Sign-In in Firebase

4. Phone Authentication:
   - Enable Phone provider in Firebase
   - Add phone number verification

5. Biometric Authentication:
   - Install react-native-biometrics
   - Add fingerprint/face unlock

6. Push Notifications:
   - Add Firebase Cloud Messaging
   - Send notifications to users

7. Offline Support:
   - Use Firebase Firestore for offline data
   - Implement proper error handling

8. Theme Support:
   - Add dark/light mode toggle
   - Store theme preference

9. Form Validation:
   - Add better form validation
   - Show field-specific errors

10. Loading States:
    - Add skeleton screens
    - Better loading indicators

SECURITY BEST PRACTICES:

1. Enable App Check in Firebase Console
2. Set up proper Firebase Security Rules
3. Use Firebase Auth Custom Claims for role-based access
4. Implement proper error handling
5. Add rate limiting for sensitive operations
6. Use HTTPS only
7. Validate all user inputs
8. Implement proper session management
9. Add two-factor authentication
10. Regular security audits

TESTING:

1. Unit Tests:
   - Test authentication functions
   - Test navigation logic
   - Test form validation

2. Integration Tests:
   - Test complete authentication flow
   - Test Firebase integration
   - Test error scenarios

3. E2E Tests:
   - Test user registration flow
   - Test login/logout flow
   - Test password reset flow

DEPLOYMENT:

1. Build Release APK:
   cd android && ./gradlew assembleRelease

2. Upload to Play Store:
   - Create Play Store account
   - Upload signed APK
   - Fill app details and screenshots

3. Set up Firebase App Distribution:
   - Distribute beta versions
   - Get feedback from testers

This complete setup provides a production-ready Firebase authentication app with all the necessary features for a real-world application.
*/#   R e a c t - n a t i v e - f i r e b a s e  
 