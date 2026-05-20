import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { login } from '../../services/api';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry />
      <Button
        title="Se connecter"
        onPress={async () => {
          try {
            const data = await login('test@example.com', 'password123');
            console.log('Connexion réussie :', data);
          } catch (error) {
            console.error('Erreur de connexion :', error);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default LoginScreen;