import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { isValidElement, useState } from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { authService } from '../services/authService';

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

interface SignUpScreenProps {
  navigation:SignUpScreenNavigationProp;
}

const SignupScreen: React.FC<SignUpScreenProps> = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async()=>{
    if(!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if(!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if(password !== confirmPassword){
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if(password.length < 6){
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const result = await authService.signUp(email.trim(), password, name.trim());

    if ( result.success){
      Alert.alert('Success', 'Account created successfully!',[
        { text: 'OK', onPress: ()=>navigation.navigate('Home')}
      ]);
    }else {
      Alert.alert('Sign up Failed', result.error || 'An error occurred');
      console.error(result.error);
      
    }

    setLoading(false);
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="f8f9fa" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'android' ? 'padding' : 'height'}
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
                placeholder='Full name'
                value={name}
                onChangeText={setName}
                autoCapitalize='words'
                placeholderTextColor="#666"
              />
              <TextInput
                style={styles.input}
                placeholder='Email Address'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
                placeholderTextColor="#666"
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder='Password'
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text
                    style={styles.passwordToggleText}
                  >{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder='Confirm Password'
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text
                    style={styles.passwordToggleText}
                  >{showConfirmPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}

export default SignupScreen

const styles = StyleSheet.create({
    container: {
    flex:1,
    backgroundColor:'#f8f9fa',
  },
  scrollContainer:{
    flexGrow:1,
    justifyContent:'center'
  },
  formContainer:{
    flex:1,
    justifyContent:'center',
    paddingHorizontal:24,
    paddingVertical:32,
  },
  header:{
    alignItems:'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle:{
    fontSize:16,
    color:'#666',
    textAlign:'center',
  },
  inputContainer:{
    marginBottom:24,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth:1,
    borderColor: '#e1e5e9',
    fontSize:16,
    shadowColor:'#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation:2,
  },
  passwordContainer:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fff',
    borderRadius:12,
    marginBottom:16,
    borderColor:'#e1e5e9',
    shadowColor:'#000',
    shadowOffset:{width:0, height:1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordInput:{
    flex:1,
    paddingHorizontal: 16,
    paddingVertical:14,
    fontSize:16,
  },
  passwordToggle:{
    paddingHorizontal: 16,
  },
  passwordToggleText:{
    color:'#007AFF',
    fontSize:14,
    fontWeight:'600'
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius:12,
    alignItems:'center',
    marginBottom: 16,
    shadowColor:'#007AFF',
    shadowOffset: {width:0, height:2},
    shadowOpacity: 0.2,
    shadowRadius:4,
    elevation:4,
  },
  buttonDisabled:{
    backgroundColor:'#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText:{
    color:'#fff',
    fontSize:16,
    fontWeight:'600',
  },
  footer:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    marginTop: 24
  },
  footerText:{
    fontSize:16,
    color:'#666',
  },
  linkText:{
    fontSize:16,
    color:'#007AFF',
  },
  forgotPassword:{
    alignItems:'flex-end',
    marginBottom:24,
  },
  forgotPasswordText:{
    color:'#007AFF',
    fontSize:14,
    fontWeight:'500',
  },
  backButton:{
    alignItems:'center'
  }
})