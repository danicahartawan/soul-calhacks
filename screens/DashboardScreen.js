import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useFonts, Chivo_400Regular, Chivo_700Bold } from '@expo-google-fonts/chivo';
import { Poly_400Regular } from '@expo-google-fonts/poly';
import { Feather } from '@expo/vector-icons';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function DashboardScreen({ onNavigateToAnalyzing }) {
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedView, setSelectedView] = useState('Week');

  // Database state
  const [userProfile, setUserProfile] = useState(null);
  const [devices, setDevices] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let [fontsLoaded] = useFonts({
    Chivo_400Regular,
    Chivo_700Bold,
    Poly_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      fetchUserData();
    }
  }, [fontsLoaded]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        setError('Supabase not configured. Please update lib/supabase.js with your credentials.');
        return;
      }

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.log('No authenticated user, using demo data');
        // Use demo data if no user is authenticated
        setUserProfile({
          id: 'demo-user',
          full_name: 'Danica Hartawan',
          location: 'United States',
          email: 'demo@example.com'
        });
        setDevices([{
          device_id: 'demo-device-001',
          device_name: 'Smart Insole Left',
          user_id: 'demo-user',
          is_active: true
        }]);
        setRecentAlerts([]);
        setLoading(false);
        return;
      }

      if (!user) {
        setError('No authenticated user found');
        return;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Fetch user's devices
      const { data: userDevices, error: devicesError } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id);

      if (devicesError) {
        console.error('Error fetching devices:', devicesError);
      }

      // Fetch recent alerts for the first device
      let alerts = [];
      if (userDevices && userDevices.length > 0) {
        const { data: alertsData, error: alertsError } = await supabase
          .from('alerts')
          .select('*')
          .eq('device_id', userDevices[0].device_id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (alertsError) {
          console.error('Error fetching alerts:', alertsError);
        } else {
          alerts = alertsData || [];
        }
      }

      setUserProfile(profile || {
        id: user.id,
        full_name: user.user_metadata?.full_name || 'User',
        location: 'United States',
        email: user.email
      });
      setDevices(userDevices || []);
      setRecentAlerts(alerts);

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (recentAlerts.length === 0) return '#A8D5A8'; // Green for normal
    const criticalAlerts = recentAlerts.filter(alert =>
      alert.alert_type === 'pressure_critical' ||
      alert.alert_type === 'temperature_critical'
    );
    if (criticalAlerts.length > 0) return '#FF6B6B'; // Red for critical
    return '#FFA07A'; // Orange for warning
  };

  const getStatusText = () => {
    if (recentAlerts.length === 0) return 'Normal';
    const criticalAlerts = recentAlerts.filter(alert =>
      alert.alert_type === 'pressure_critical' ||
      alert.alert_type === 'temperature_critical'
    );
    if (criticalAlerts.length > 0) return 'Critical';
    return 'Warning';
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
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
            <Text style={styles.userName}>{userProfile?.full_name || 'User'}</Text>
            <Text style={styles.userLocation}>{userProfile?.location || 'United States'}</Text>
            {devices.length > 0 && (
              <Text style={styles.deviceCount}>{devices.length} device{devices.length !== 1 ? 's' : ''} connected</Text>
            )}
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

        {/* Recent Alerts Section */}
        {recentAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.alertsTitle}>Recent Alerts</Text>
            {recentAlerts.slice(0, 3).map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <View style={styles.alertIcon}>
                  <Feather
                    name={alert.alert_type.includes('critical') ? 'alert-triangle' : 'info'}
                    size={16}
                    color={alert.alert_type.includes('critical') ? '#FF6B6B' : '#FFA07A'}
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage}>{alert.alert_message}</Text>
                  <Text style={styles.alertTime}>
                    {new Date(alert.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Status Indicator */}
        <View style={styles.statusSection}>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: getStatusColor() }]}
            onPress={onNavigateToAnalyzing}
          >
            <Text style={styles.statusText}>{getStatusText()}</Text>
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
  // New styles for database integration
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Chivo_400Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Chivo_400Regular',
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Chivo_400Regular',
  },
  deviceCount: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Chivo_400Regular',
    marginTop: 2,
  },
  alertsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Chivo_700Bold',
    marginBottom: 15,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Chivo_400Regular',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Chivo_400Regular',
  },
});