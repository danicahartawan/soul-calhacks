import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useFonts, Chivo_400Regular, Chivo_700Bold } from '@expo-google-fonts/chivo';
import { Poly_400Regular } from '@expo-google-fonts/poly';

export default function SoulScreen({ onAnimationComplete }) {
  let [fontsLoaded] = useFonts({
    Chivo_400Regular,
    Chivo_700Bold,
    Poly_400Regular,
  });

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }
    
    // Navigate immediately after fonts load
    const timer = setTimeout(() => {
      console.log('Timer completed, calling onAnimationComplete...');
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 1000); // Short delay to show the screen briefly

    return () => clearTimeout(timer);
  }, [fontsLoaded, onAnimationComplete]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.soulText}>Soul</Text>
      </View>
      
      <View style={styles.centerSection}>
        <Image 
          source={require('../assets/Screenshot_2025-10-25_at_16.58.12-removebg-preview.png')}
          style={styles.flowerImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.bottomSection}>
        <Text style={styles.connectText}>
          connect your soul
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 40,
    paddingTop: 60,
  },
  centerSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    flex: 0.2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 100,
  },
  soulText: {
    fontSize: 32,
    fontWeight: 'normal',
    color: '#000000',
    fontFamily: 'Chivo_400Regular',
    display: 'inline-block',
  },
  flowerImage: {
    width: 200,
    height: 150,
  },
  connectText: {
    fontSize: 18,
    color: '#000000',
    fontFamily: 'Poly_400Regular',
    textAlign: 'center',
  },
});
