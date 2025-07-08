import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user)=>{
      setUser(user);
      if(!user){
        navigation.reset({
          index:0,
          routes:[{name: 'Login'}],
        });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout =async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text:'Cancel', style:'cancel'},
        {
          text:'Logout',
          style:'destructive',
          onPress:async()=>{
            const result = await authService.signOut();
            if(result.success){
              navigation.reset({
                index:0,
                routes:[{name: 'Login'}],
              });
            }
          }
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
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#f8f9fa',
  },
  header:{
    alignItems:'center',
    marginBottom: 32,
  },
  headerContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(252, 10, 10, 0.77)',
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