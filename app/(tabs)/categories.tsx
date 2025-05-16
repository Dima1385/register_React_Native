import React from 'react';
import { StyleSheet, View } from 'react-native';
import CategoriesScreen from '../categories';

export default function CategoriesTab() {
  return (
    <View style={styles.container}>
      <CategoriesScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 