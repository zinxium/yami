import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const AddBorrowerScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un Emprunteur</Text>
      <TextInput style={styles.input} placeholder="Nom de l'emprunteur" />
      <Button title="Ajouter" onPress={() => {}} />
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

export default AddBorrowerScreen;