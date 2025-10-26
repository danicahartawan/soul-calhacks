import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFonts, Chivo_400Regular, Chivo_700Bold } from '@expo-google-fonts/chivo';
import { Feather } from '@expo/vector-icons';

export default function AnalyzingScreen() {
  let [fontsLoaded] = useFonts({
    Chivo_400Regular,
    Chivo_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Top Section with Analyzing text */}
      <View style={styles.topSection}>
        <Text style={styles.analyzingText}>Analyzing...</Text>
      </View>

      {/* Center Section with Footprint */}
      <View style={styles.centerSection}>
        <View style={styles.footprintContainer}>
          {/* Footprint outline */}
          <View style={styles.footprintOutline}>
            <View style={styles.footprintInner}>
              {/* Dots pattern inside footprint */}
              <View style={styles.dotsContainer}>
                {Array.from({ length: 40 }).map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.dot,
                      { 
                        top: `${20 + (index % 8) * 10}%`,
                        left: `${20 + Math.floor(index / 8) * 12}%`
                      }
                    ]} 
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Section with Test Results */}
      <View style={styles.bottomSection}>
        <Text style={styles.testsTitle}>Tests this week</Text>
        
        <View style={styles.testsContainer}>
          {/* Current Test Card */}
          <View style={styles.testCard}>
            <Text style={styles.testNumber}>25</Text>
            <Text style={styles.testSubtext}>1:04 mins left...</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Text style={styles.moreIcon}>•••</Text>
            </TouchableOpacity>
          </View>
          
          {/* Recorded Test Card */}
          <View style={styles.recordedCard}>
            <Text style={styles.recordedNumber}>24</Text>
            <Text style={styles.recordedLabel}>Recorded</Text>
            <Text style={styles.recordedDate}>Saved on 10/24</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Text style={styles.moreIcon}>•••</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="#999999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.navIcon, styles.activeNavIcon]}>
            <Feather name="activity" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="calendar" size={24} color="#999999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="sliders" size={24} color="#999999" />
        </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  analyzingText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#000',
    fontFamily: 'Chivo_400Regular',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  footprintContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footprintOutline: {
    width: 160,
    height: 280,
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 80,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  footprintInner: {
    flex: 1,
    position: 'relative',
  },
  dotsContainer: {
    flex: 1,
    position: 'relative',
  },
  dot: {
    width: 2,
    height: 2,
    backgroundColor: '#000',
    borderRadius: 1,
    position: 'absolute',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  testsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Chivo_700Bold',
    marginBottom: 20,
  },
  testsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  testCard: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    position: 'relative',
  },
  testNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'Chivo_700Bold',
    marginBottom: 5,
  },
  testSubtext: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: 'Chivo_400Regular',
  },
  recordedCard: {
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    position: 'relative',
  },
  recordedNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#CCC',
    fontFamily: 'Chivo_700Bold',
    marginBottom: 5,
  },
  recordedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Chivo_700Bold',
    marginBottom: 2,
  },
  recordedDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Chivo_400Regular',
  },
  moreButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  moreIcon: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
    color: '#888',
  },
  activeNavIcon: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});