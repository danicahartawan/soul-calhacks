import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFonts, Chivo_400Regular, Chivo_700Bold } from '@expo-google-fonts/chivo';
import { Feather } from '@expo/vector-icons';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function AnalyzingScreen() {
  // Database state
  const [sensorData, setSensorData] = useState([]);
  const [currentReading, setCurrentReading] = useState(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [testCount, setTestCount] = useState(25);
  const [timeLeft, setTimeLeft] = useState(64); // seconds

  let [fontsLoaded] = useFonts({
    Chivo_400Regular,
    Chivo_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      initializeData();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    let interval;
    if (isAnalyzing && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsAnalyzing(false);
      setTestCount(prev => prev + 1);
      setTimeLeft(64);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing, timeLeft]);

  const initializeData = async () => {
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

      if (authError || !user) {
        console.log('No authenticated user, using demo data');
        // Use demo data if no user is authenticated
        setDevices([{
          device_id: 'demo-device-001',
          device_name: 'Smart Insole Left',
          user_id: 'demo-user',
          is_active: true
        }]);
        setCurrentReading({
          pressure: 85.2,
          temperature: 36.1,
          humidity: 45.3,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        return;
      }

      // Fetch user's devices
      const { data: userDevices, error: devicesError } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (devicesError) {
        console.error('Error fetching devices:', devicesError);
      }

      // Fetch recent sensor readings
      if (userDevices && userDevices.length > 0) {
        const { data: readings, error: readingsError } = await supabase
          .from('sensor_readings')
          .select('*')
          .eq('device_id', userDevices[0].device_id)
          .order('timestamp', { ascending: false })
          .limit(10);

        if (readingsError) {
          console.error('Error fetching readings:', readingsError);
        } else {
          setSensorData(readings || []);
          if (readings && readings.length > 0) {
            setCurrentReading(readings[0]);
          }
        }
      }

      setDevices(userDevices || []);

    } catch (err) {
      console.error('Error initializing data:', err);
      setError('Failed to load sensor data');
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setTimeLeft(64);

    // Subscribe to real-time sensor data updates
    if (devices.length > 0) {
      const subscription = supabase
        .channel('sensor_readings')
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'sensor_readings',
            filter: `device_id=eq.${devices[0].device_id}`
          },
          (payload) => {
            console.log('New sensor reading received:', payload.new);
            setCurrentReading(payload.new);
            setSensorData(prev => [payload.new, ...prev.slice(0, 9)]);
          }
        )
        .subscribe();

      // Store subscription for cleanup
      return () => subscription.unsubscribe();
    }
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    setTimeLeft(64);
  };

  const getPressureStatus = (pressure) => {
    if (pressure > 100) return { status: 'Critical', color: '#FF6B6B' };
    if (pressure > 80) return { status: 'High', color: '#FFA07A' };
    return { status: 'Normal', color: '#A8D5A8' };
  };

  const getTemperatureStatus = (temperature) => {
    const diff = Math.abs(temperature - 36.5);
    if (diff > 2) return { status: 'Critical', color: '#FF6B6B' };
    if (diff > 1) return { status: 'High', color: '#FFA07A' };
    return { status: 'Normal', color: '#A8D5A8' };
  };

  const getHumidityStatus = (humidity) => {
    if (humidity > 80) return { status: 'High', color: '#FFA07A' };
    if (humidity > 60) return { status: 'Moderate', color: '#FFD700' };
    return { status: 'Normal', color: '#A8D5A8' };
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading sensor data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pressureStatus = currentReading ? getPressureStatus(currentReading.pressure) : { status: 'Normal', color: '#A8D5A8' };
  const temperatureStatus = currentReading ? getTemperatureStatus(currentReading.temperature) : { status: 'Normal', color: '#A8D5A8' };
  const humidityStatus = currentReading ? getHumidityStatus(currentReading.humidity) : { status: 'Normal', color: '#A8D5A8' };

  return (
    <View style={styles.container}>
      {/* Top Section with Analyzing text */}
      <View style={styles.topSection}>
        <Text style={styles.analyzingText}>
          {isAnalyzing ? 'Analyzing...' : 'Ready to Analyze'}
        </Text>
        {devices.length > 0 && (
          <Text style={styles.deviceInfo}>
            Connected: {devices[0].device_name}
          </Text>
        )}
      </View>

      {/* Center Section with Footprint and Real-time Data */}
      <View style={styles.centerSection}>
        <View style={styles.footprintContainer}>
          {/* Footprint outline */}
          <View style={styles.footprintOutline}>
            <View style={styles.footprintInner}>
              {/* Real-time sensor dots */}
              <View style={styles.dotsContainer}>
                {Array.from({ length: 40 }).map((_, index) => {
                  const intensity = currentReading ?
                    (index % 3 === 0 ? currentReading.pressure / 100 :
                      index % 3 === 1 ? currentReading.temperature / 40 :
                        currentReading.humidity / 100) : 0.5;

                  return (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          top: `${20 + (index % 8) * 10}%`,
                          left: `${20 + Math.floor(index / 8) * 12}%`,
                          opacity: intensity,
                          backgroundColor: intensity > 0.8 ? '#FF6B6B' :
                            intensity > 0.6 ? '#FFA07A' : '#000'
                        }
                      ]}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Real-time Sensor Values */}
        {currentReading && (
          <View style={styles.sensorValues}>
            <View style={styles.sensorRow}>
              <Text style={styles.sensorLabel}>Pressure:</Text>
              <Text style={[styles.sensorValue, { color: pressureStatus.color }]}>
                {currentReading.pressure.toFixed(1)} kPa
              </Text>
              <Text style={[styles.sensorStatus, { color: pressureStatus.color }]}>
                {pressureStatus.status}
              </Text>
            </View>
            <View style={styles.sensorRow}>
              <Text style={styles.sensorLabel}>Temperature:</Text>
              <Text style={[styles.sensorValue, { color: temperatureStatus.color }]}>
                {currentReading.temperature.toFixed(1)}°C
              </Text>
              <Text style={[styles.sensorStatus, { color: temperatureStatus.color }]}>
                {temperatureStatus.status}
              </Text>
            </View>
            <View style={styles.sensorRow}>
              <Text style={styles.sensorLabel}>Humidity:</Text>
              <Text style={[styles.sensorValue, { color: humidityStatus.color }]}>
                {currentReading.humidity.toFixed(1)}%
              </Text>
              <Text style={[styles.sensorStatus, { color: humidityStatus.color }]}>
                {humidityStatus.status}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Section with Test Results */}
      <View style={styles.bottomSection}>
        <Text style={styles.testsTitle}>Tests this week</Text>

        <View style={styles.testsContainer}>
          {/* Current Test Card */}
          <View style={styles.testCard}>
            <Text style={styles.testNumber}>{testCount}</Text>
            <Text style={styles.testSubtext}>
              {isAnalyzing ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')} mins left...` : 'Ready to start'}
            </Text>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={isAnalyzing ? stopAnalysis : startAnalysis}
            >
              <Feather
                name={isAnalyzing ? 'pause' : 'play'}
                size={16}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>

          {/* Recorded Test Card */}
          <View style={styles.recordedCard}>
            <Text style={styles.recordedNumber}>{testCount - 1}</Text>
            <Text style={styles.recordedLabel}>Recorded</Text>
            <Text style={styles.recordedDate}>
              Saved on {new Date().toLocaleDateString()}
            </Text>
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
  deviceInfo: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Chivo_400Regular',
    marginTop: 5,
  },
  sensorValues: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sensorLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Chivo_400Regular',
    flex: 1,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Chivo_700Bold',
    marginRight: 10,
  },
  sensorStatus: {
    fontSize: 12,
    fontFamily: 'Chivo_400Regular',
  },
  controlButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});