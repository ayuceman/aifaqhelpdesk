# PayPal Sandbox Setup Guide

## 🚀 Quick Setup

### 1. Get PayPal Sandbox Credentials

1. **Go to PayPal Developer Portal**: https://developer.paypal.com/
2. **Sign up** for a developer account (free)
3. **Create a new application**:
   - Click "Create App"
   - Select "Sandbox" environment
   - Choose "Default Application" or create custom
4. **Copy your credentials**:
   - Client ID
   - Client Secret

### 2. Configure Your Application

**Option A: Use the setup script (Recommended)**
```bash
cd server
node setup-paypal.js YOUR_CLIENT_ID YOUR_CLIENT_SECRET
```

**Option B: Manual setup**
1. Create `server/.env` file
2. Add your PayPal credentials:
```env
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
NODE_ENV=development
```

### 3. Restart Your Server
```bash
npm run dev
```

## 🧪 Testing the Payment Flow

### 1. Start the Application
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client  
cd client && npm run dev
```

### 2. Test the Upgrade Flow
1. **Open**: http://localhost:5173
2. **Login** or create a new account
3. **Navigate** to upgrade page
4. **Select** any paid plan (Starter, Professional, Enterprise)
5. **Click** "Upgrade" button
6. **You'll be redirected** to PayPal sandbox

### 3. Use PayPal Sandbox Test Accounts

**For testing, use these sandbox accounts:**

**Buyer Account (to test payments):**
- Email: `sb-buyer@personal.example.com`
- Password: `password123`

**Seller Account (your business account):**
- Email: `sb-seller@business.example.com`  
- Password: `password123`

## 🔧 PayPal Sandbox Features

### ✅ What Works
- **Real PayPal Interface**: Full PayPal checkout experience
- **Test Transactions**: No real money charged
- **Payment Capture**: Automatic payment processing
- **Success/Cancel Handling**: Proper redirects
- **Database Integration**: Payment tracking

### 🎯 Test Scenarios
1. **Successful Payment**: Complete the PayPal flow
2. **Cancelled Payment**: Click "Cancel" in PayPal
3. **Failed Payment**: Use invalid test card
4. **Different Plans**: Test all pricing tiers

## 🔍 Troubleshooting

### Common Issues

**1. "PayPal credentials not configured"**
- Run the setup script: `node setup-paypal.js YOUR_CLIENT_ID YOUR_CLIENT_SECRET`
- Restart the server

**2. "Invalid PayPal credentials"**
- Double-check your Client ID and Secret
- Ensure you're using sandbox credentials (not production)

**3. "Payment capture failed"**
- Check PayPal developer dashboard for errors
- Verify your return URLs are correct

**4. "Redirect not working"**
- Ensure your server is running on port 3001
- Check that return URLs point to your server

### Debug Steps
1. **Check server logs** for PayPal API responses
2. **Verify environment variables** are loaded
3. **Test PayPal API** directly with curl
4. **Check database** for payment intent records

## 🚀 Production Deployment

When ready for production:

1. **Get Production Credentials**:
   - Create production app in PayPal developer portal
   - Get production Client ID and Secret

2. **Update Environment**:
   ```env
   PAYPAL_CLIENT_ID=your-production-client-id
   PAYPAL_CLIENT_SECRET=your-production-client-secret
   NODE_ENV=production
   ```

3. **Update Return URLs**:
   - Change return URLs to your production domain
   - Update in `paymentService.ts`

## 📚 Additional Resources

- **PayPal Developer Docs**: https://developer.paypal.com/docs/
- **Sandbox Testing**: https://developer.paypal.com/docs/api-basics/sandbox/
- **Webhooks**: For production, consider PayPal webhooks for payment notifications
