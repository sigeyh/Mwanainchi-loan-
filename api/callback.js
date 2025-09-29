module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const callbackData = req.body;
      console.log('M-Pesa Callback:', JSON.stringify(callbackData, null, 2));
      
      // Process the callback
      const resultCode = callbackData.Body.stkCallback.ResultCode;
      
      if (resultCode === 0) {
        // Payment successful
        console.log('Payment successful for checkout:', callbackData.Body.stkCallback.CheckoutRequestID);
        // Here you would:
        // 1. Update your database
        // 2. Send confirmation SMS/email
        // 3. Process the loan disbursement
      } else {
        // Payment failed
        console.log('Payment failed:', callbackData.Body.stkCallback.ResultDesc);
      }
      
      res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
    } catch (error) {
      console.error('Callback processing error:', error);
      res.status(500).json({ ResultCode: 1, ResultDesc: "Failed" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};