import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const MyLoansScreen = () => {
  const loans = [
    { id: '1', title: 'Prêt 1', amount: '1000€' },
    { id: '2', title: 'Prêt 2', amount: '500€' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Prêts</Text>
      <FlatList
        data={loans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.loanItem}>
            <Text style={styles.loanTitle}>{item.title}</Text>
            <Text>{item.amount}</Text>
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
  loanItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  loanTitle: {
    fontWeight: 'bold',
  },
});

export default MyLoansScreen;