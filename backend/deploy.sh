#!/bin/bash

# SoleForSole Backend Deployment Script

set -e

echo "🚀 Starting SoleForSole Backend Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy env.example to .env and configure your environment variables."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Check if database schema is applied
echo "🗄️  Checking database setup..."
echo "Please ensure you have:"
echo "1. Created a Supabase project"
echo "2. Applied the database schema from src/database/schema.sql"
echo "3. Configured Row Level Security policies"
echo "4. Set up environment variables in .env"

# Start the application
echo "🎯 Starting application..."
npm start
