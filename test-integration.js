#!/usr/bin/env node

/**
 * Test script for Soul CalHacks integration
 * This script helps test the complete flow from backend API to mobile app database integration
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:3000';
const TEST_DEVICE_ID = 'demo-device-001';

// Test data
const testSensorData = [
    {
        device_id: TEST_DEVICE_ID,
        pressure: 85.2,
        temperature: 36.1,
        humidity: 45.3
    },
    {
        device_id: TEST_DEVICE_ID,
        pressure: 95.8,
        temperature: 36.8,
        humidity: 52.1
    },
    {
        device_id: TEST_DEVICE_ID,
        pressure: 105.5, // This should trigger an alert
        temperature: 37.2,
        humidity: 48.7
    },
    {
        device_id: TEST_DEVICE_ID,
        pressure: 78.3,
        temperature: 35.9,
        humidity: 41.2
    }
];

async function testBackendAPI() {
    console.log('🧪 Testing Backend API Integration...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health endpoint...');
        const healthResponse = await axios.get(`${BACKEND_URL}/health`);
        console.log('✅ Health check passed:', healthResponse.data);

        // Test 2: Send sensor readings
        console.log('\n2️⃣ Sending test sensor readings...');
        for (let i = 0; i < testSensorData.length; i++) {
            const reading = testSensorData[i];
            console.log(`   Sending reading ${i + 1}: Pressure=${reading.pressure}kPa, Temp=${reading.temperature}°C, Humidity=${reading.humidity}%`);

            try {
                const response = await axios.post(`${BACKEND_URL}/api/readings`, reading);
                console.log(`   ✅ Reading ${i + 1} sent successfully`);

                // Wait a bit between readings to simulate real sensor data
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.log(`   ❌ Failed to send reading ${i + 1}:`, error.response?.data || error.message);
            }
        }

        // Test 3: Check alerts
        console.log('\n3️⃣ Checking for generated alerts...');
        try {
            const alertsResponse = await axios.get(`${BACKEND_URL}/api/alerts`);
            console.log('✅ Alerts retrieved:', alertsResponse.data);

            if (alertsResponse.data.length > 0) {
                console.log('🚨 Active alerts found:');
                alertsResponse.data.forEach((alert, index) => {
                    console.log(`   ${index + 1}. ${alert.alert_type}: ${alert.alert_message}`);
                });
            } else {
                console.log('ℹ️ No alerts found');
            }
        } catch (error) {
            console.log('❌ Failed to retrieve alerts:', error.response?.data || error.message);
        }

        // Test 4: Get sensor readings
        console.log('\n4️⃣ Retrieving sensor readings...');
        try {
            const readingsResponse = await axios.get(`${BACKEND_URL}/api/readings/${TEST_DEVICE_ID}`);
            console.log('✅ Sensor readings retrieved:', readingsResponse.data.length, 'readings');

            if (readingsResponse.data.length > 0) {
                const latest = readingsResponse.data[0];
                console.log(`   Latest reading: Pressure=${latest.pressure}kPa, Temp=${latest.temperature}°C, Humidity=${latest.humidity}%`);
            }
        } catch (error) {
            console.log('❌ Failed to retrieve readings:', error.response?.data || error.message);
        }

    } catch (error) {
        console.log('❌ Backend API test failed:', error.message);
        console.log('\n💡 Make sure your backend server is running:');
        console.log('   cd backend && npm run dev');
    }
}

async function testMobileAppIntegration() {
    console.log('\n📱 Mobile App Integration Test...\n');

    console.log('1️⃣ Supabase Configuration Check:');
    console.log('   📝 Update lib/supabase.js with your Supabase credentials:');
    console.log('   - SUPABASE_URL: https://your-project-id.supabase.co');
    console.log('   - SUPABASE_ANON_KEY: your-anon-key-here');

    console.log('\n2️⃣ Database Schema Setup:');
    console.log('   📝 Run the SQL schema in your Supabase SQL editor:');
    console.log('   - Copy contents from backend/src/database/schema.sql');
    console.log('   - Execute the SQL to create tables and RLS policies');

    console.log('\n3️⃣ Test Scenarios:');
    console.log('   🧪 Dashboard Screen:');
    console.log('   - Should show user profile and device information');
    console.log('   - Should display recent alerts if any');
    console.log('   - Should show device connection status');

    console.log('\n   🧪 Analyzing Screen:');
    console.log('   - Should display real-time sensor data');
    console.log('   - Should show sensor status (Normal/High/Critical)');
    console.log('   - Should update in real-time when new data arrives');

    console.log('\n4️⃣ Expected Behavior:');
    console.log('   ✅ App loads with demo data if Supabase not configured');
    console.log('   ✅ App shows loading states during data fetching');
    console.log('   ✅ App displays error messages with retry options');
    console.log('   ✅ Real-time updates work when backend sends new data');
}

async function runTests() {
    console.log('🚀 Soul CalHacks Integration Test Suite\n');
    console.log('='.repeat(50));

    await testBackendAPI();
    await testMobileAppIntegration();

    console.log('\n' + '='.repeat(50));
    console.log('✨ Test suite completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Update Supabase credentials in lib/supabase.js');
    console.log('2. Set up database schema in Supabase');
    console.log('3. Start the mobile app: npm start');
    console.log('4. Test the complete flow end-to-end');
}

// Run tests if this script is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testBackendAPI, testMobileAppIntegration };
