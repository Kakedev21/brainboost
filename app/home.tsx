import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const Home = () => {
  const [showRegisterOptions, setShowRegisterOptions] = useState(false);
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#7F00FF', '#E100FF']} // Purple to Blue gradient
      style={styles.container}
    >
      <Image
        source={require('../assets/images/Picture.png')} // Logo
        style={styles.logo}
      />
      <Text style={styles.title}>BrainBoost Cards</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('login' as never)}
      >
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={() => setShowRegisterOptions(!showRegisterOptions)}
      >
        <Text style={styles.buttonText}>REGISTER</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      {showRegisterOptions && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => navigation.navigate('register' as never)}
          >
            <Text style={styles.dropdownText}>Student Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => navigation.navigate('teacherregister' as never)}
          >
            <Text style={styles.dropdownText}>Teacher Register</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: 'serif', // Change to a custom script font if available
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '70%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  registerButton: {
    position: 'relative',
  },
  dropdownArrow: {
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '70%',
    position: 'absolute',
    top: '55%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  dropdownButton: {
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 16,
    color: '#4169E1',
  },
});

export default Home;
