#!/usr/bin/env node

/**
 * PayPal Sandbox Setup Script
 * 
 * This script helps you set up PayPal sandbox credentials for testing.
 * 
 * Steps:
 * 1. Go to https://developer.paypal.com/
 * 2. Create a developer account
 * 3. Create a new application
 * 4. Select "Sandbox" environment
 * 5. Copy the Client ID and Client Secret
 * 6. Run this script with your credentials
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
PayPal Sandbox Setup

Usage: node setup-paypal.js <CLIENT_ID> <CLIENT_SECRET>

Example:
  node setup-paypal.js AQkquBDf1zctJOWGKWUEtKXm6qVhueUEMvXO_-MCI4d0lZOFKTKjnGsZ MKOo-Z3ED5X8EyL4PJ8J3Vpdksg

Steps to get credentials:
1. Go to https://developer.paypal.com/
2. Sign up for a developer account
3. Create a new application
4. Select "Sandbox" environment
5. Copy the Client ID and Client Secret
6. Run this script with your credentials
`);
  process.exit(1);
}

const [clientId, clientSecret] = args;

// Create .env file with PayPal credentials
const envContent = `PORT=3001

# Support & Contact
SUPPORT_EMAIL=support@yourcompany.com
CLIENT_URL=http://localhost:5173

# Use Ollama by default (set to 'false' to use OpenAI)
USE_OLLAMA=true

# Ollama Configuration (Local LLM - Default)
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen2.5:3b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# OpenAI Configuration (Optional - only if USE_OLLAMA=false)
LLM_API_KEY=your_openai_api_key_here
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo
EMBEDDING_MODEL=text-embedding-ada-002

# Security
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=60

# PayPal Sandbox Configuration
PAYPAL_CLIENT_ID=${clientId}
PAYPAL_CLIENT_SECRET=${clientSecret}
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ PayPal sandbox credentials configured successfully!');
  console.log('📁 Environment file created at:', envPath);
  console.log('');
  console.log('🚀 You can now test the payment flow:');
  console.log('   1. Restart your server: npm run dev');
  console.log('   2. Go to http://localhost:5173');
  console.log('   3. Login and try upgrading your plan');
  console.log('   4. Use PayPal sandbox test accounts for testing');
  console.log('');
  console.log('💡 Note: All transactions are test transactions in sandbox mode');
} catch (error) {
  console.error('❌ Error creating environment file:', error.message);
  process.exit(1);
}
