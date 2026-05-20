import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { signup } from '../../services/api';

const SignupScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput style={styles.input} placeholder="Nom" />
      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry />
      <Button
        title="S'inscrire"
        onPress={async () => {
          try {
            const data = await signup('Nom Test', 'test@example.com', 'password123');
            console.log('Inscription réussie :', data);
          } catch (error) {
            console.error('Erreur d\'inscription :', error);
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

export default SignupScreen;