# PayPal Sandbox Configuration

To set up PayPal sandbox integration, you need to:

1. **Create PayPal Developer Account**:
   - Go to https://developer.paypal.com/
   - Sign up for a developer account
   - Create a new application

2. **Get Sandbox Credentials**:
   - In your PayPal developer dashboard, create a new app
   - Select "Sandbox" environment
   - Copy the Client ID and Client Secret

3. **Set Environment Variables**:
   ```bash
   PAYPAL_CLIENT_ID=your-sandbox-client-id
   PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
   ```

4. **Test with Sandbox Accounts**:
   - Use PayPal sandbox test accounts for testing
   - No real money will be charged

## Current Configuration

The system is configured to use PayPal sandbox by default:
- Base URL: https://api-m.sandbox.paypal.com
- Environment: development
- All transactions are test transactions
