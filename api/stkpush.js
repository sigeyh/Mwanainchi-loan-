const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, amount } = req.body;
    
    if (!phoneNumber || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Your M-Pesa credentials (set in Vercel environment variables)
    const consumerKey = UctWTuB0hS3g90B0ptC5TljFHYkIzerbeSgElkMnRA7TJG69N3YWhUob1ZgmxEBK;
    const consumerSecret = UctWTuB0hS3g90B0ptC5TljFHYkIzerbeSgElkMnRA7TJG69N3YWhUob1ZgmxEBK;
    const businessShortCode = process.env.9824375;
    const passkey = process.env.bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919;
    
    // Get access token
    const authResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
        }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

    // Initiate STK push
    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.VERCEL_https://mydomain.com/mpesa-express-simulate/}/api/callback`,
        AccountReference: 'Mwanainchi Credit',
        TransactionDesc: 'Loan Service Fee'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({
      success: true,
      data: stkResponse.data,
      message: 'STK push initiated successfully'
    });

  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
      message: 'Failed to initiate STK push'
    });
  }
};