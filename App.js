import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import SoulScreen from './screens/SoulScreen';
import DashboardScreen from './screens/DashboardScreen';
import AnalyzingScreen from './screens/AnalyzingScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('soul');

  const navigateToDashboard = () => {
    console.log('Navigating to dashboard...');
    setCurrentScreen('dashboard');
  };

  const navigateToAnalyzing = () => {
    console.log('Navigating to analyzing...');
    setCurrentScreen('analyzing');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'soul':
        return <SoulScreen onAnimationComplete={navigateToDashboard} />;
      case 'dashboard':
        return <DashboardScreen onNavigateToAnalyzing={navigateToAnalyzing} />;
      case 'analyzing':
        return <AnalyzingScreen />;
      default:
        return <DashboardScreen onNavigateToAnalyzing={navigateToAnalyzing} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <StatusBar style="dark" />
    </>
  );
}
