import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useFonts, Chivo_400Regular, Chivo_700Bold } from '@expo-google-fonts/chivo';
import { Poly_400Regular } from '@expo-google-fonts/poly';
import { Feather } from '@expo/vector-icons';

export default function DashboardScreen({ onNavigateToAnalyzing }) {
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedView, setSelectedView] = useState('Week');
  
  let [fontsLoaded] = useFonts({
    Chivo_400Regular,
    Chivo_700Bold,
    Poly_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  const months = ['April', 'May', 'June', 'July', 'August'];
  const weekDays = ['M', 'T', 'S', 'F', 'T', 'S', 'W'];
  const progressData = [0.7, 0.4, 0.9, 0.6, 0.3, 0.8, 0.5];
  const progressColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/60x60' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>Danica Hartawan</Text>
            <Text style={styles.userLocation}>United States</Text>
          </View>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          {months.map((month) => (
            <TouchableOpacity
              key={month}
              onPress={() => setSelectedMonth(month)}
              style={[
                styles.monthButton,
                selectedMonth === month && styles.selectedMonth
              ]}
            >
              <Text style={[
                styles.monthText,
                selectedMonth === month && styles.selectedMonthText
              ]}>
                {month}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreText}>...</Text>
          </TouchableOpacity>
        </View>

        {/* Progression Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progression</Text>
            <TouchableOpacity style={styles.weekSelector}>
              <Text style={styles.weekText}>Week</Text>
              <Text style={styles.chevron}>⌄</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Chart */}
          <View style={styles.chartContainer}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.progressBar,
                      { 
                        height: progressData[index] * 120,
                        backgroundColor: progressColors[index]
                      }
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusSection}>
          <TouchableOpacity style={styles.statusButton} onPress={onNavigateToAnalyzing}>
            <Text style={styles.statusText}>Normal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.navIcon, styles.activeNavIcon]}>
            <Feather name="home" size={24} color="#000000" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="bar-chart-2" size={24} color="#999999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="calendar" size={24} color="#999999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="settings" size={24} color="#999999" />
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Chivo_700Bold',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Chivo_400Regular',
  },
  monthNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  monthButton: {
    marginRight: 20,
  },
  monthText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Chivo_400Regular',
  },
  selectedMonth: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  selectedMonthText: {
    color: '#000',
    fontWeight: '600',
  },
  moreButton: {
    marginLeft: 'auto',
  },
  moreText: {
    fontSize: 16,
    color: '#888',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Chivo_700Bold',
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  weekText: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
    fontFamily: 'Chivo_400Regular',
  },
  chevron: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingHorizontal: 10,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  progressBar: {
    width: 20,
    borderRadius: 10,
    minHeight: 20,
  },
  dayLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Chivo_400Regular',
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusButton: {
    backgroundColor: '#A8D5A8',
    paddingHorizontal: 60,
    paddingVertical: 15,
    borderRadius: 25,
  },
  statusText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
    fontFamily: 'Chivo_400Regular',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
  homeIcon: {
    color: '#fff',
    fontSize: 20,
  },
});