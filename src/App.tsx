import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SignupScreen from './screens/SignupScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import { RootStackParamList } from './types/navigation';
import { User } from 'firebase/auth';
import { authService } from './services/authService';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App:React.FC = () => {
  const [user, setUser]= useState<User | null>(null);
  const [loading, setLoading]= useState(true);

  useEffect(()=>{
    const unsubscribe = authService.onAuthStateChanged((user)=>{
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  },[]);

  if(loading){
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF"/>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={user ? 'Home': 'Login'}
        screenOptions={{
          headerShown:false,
          gestureEnabled:true,
        }}
        >
        <Stack.Screen name='Login' component={LoginScreen}/>
        <Stack.Screen name='Signup' component={SignupScreen}/>
        <Stack.Screen name='Home' component={HomeScreen}/>
        <Stack.Screen name='ForgetPassword' component={ForgetPasswordScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({
  loadingContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#f8f9fa',
  },
});