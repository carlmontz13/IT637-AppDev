import type { PropsWithChildren } from 'react';
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use a relative require so Metro/Web can bundle the asset correctly.
const image = require('../../assets/images/asdasdasd.jpg');

export function AppBackground({ children }: PropsWithChildren) {
  return (
    <ImageBackground source={image} resizeMode="cover" style={styles.image}>
      <SafeAreaView style={styles.overlay} edges={['top', 'left', 'right', 'bottom']}>
        {children}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.84)',
  },
});
