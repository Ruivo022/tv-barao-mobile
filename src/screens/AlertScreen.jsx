import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import colors from '../theme/colors';

export default function Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        TV BARÃO
      </Text>

      <Text style={styles.subtitle}>
        Em construção...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 10,
  },
});