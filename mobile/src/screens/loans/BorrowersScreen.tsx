import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const BorrowersScreen = () => {
  const borrowers = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Emprunteurs</Text>
      <FlatList
        data={borrowers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.borrowerItem}>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  borrowerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default BorrowersScreen;