// M-Pesa API Configuration
// TODO: Replace these with your actual M-Pesa API credentials
const MPESA_CONFIG = {
  CONSUMER_KEY: 'lZb0uGUyoxm8SH5Di77Pxy3aXDEQWr1sQJ0QdB6P1rywzgdE',
  CONSUMER_SECRET: 'ksjoGQHUAIvZmD5UQi9Js0FFzM6OTdgySA4fPdxiNOjIX4GriljMt6Grj9ccJtph',
  BUSINESS_SHORT_CODE: '247247', // Your paybill number
  PASSKEY: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  CALLBACK_URL: 'https://rebearthsolutions.co.ke/api/mpesa/callback',
  CONFIRMATION_URL: 'https://rebearthsolutions.co.ke/api/mpesa/confirmation',
  VALIDATION_URL: 'https://rebearthsolutions.co.ke/api/mpesa/validation',
  BASE_URL: 'https://sandbox.safaricom.co.ke', // Use https://api.safaricom.co.ke for production
};

export interface STKPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface CallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export interface ValidationRequest {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: string;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber: string;
  OrgAccountBalance: string;
  ThirdPartyTransID: string;
  MSISDN: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
}

export interface ValidationResponse {
  ResultCode: string;
  ResultDesc: string;
}

// Generate M-Pesa password
export const generatePassword = (timestamp: string): string => {
  const data = MPESA_CONFIG.BUSINESS_SHORT_CODE + MPESA_CONFIG.PASSKEY + timestamp;
  return btoa(data);
};

// Generate timestamp
export const generateTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

// Get OAuth token
export const getOAuthToken = async (): Promise<string> => {
  const auth = btoa(`${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`);
  
  const response = await fetch(`${MPESA_CONFIG.BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
    },
  });

  const data = await response.json();
  return data.access_token;
};

// Initiate STK Push
export const initiateSTKPush = async (
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string
): Promise<STKPushResponse> => {
  const token = await getOAuthToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp);

  const requestBody: STKPushRequest = {
    BusinessShortCode: MPESA_CONFIG.BUSINESS_SHORT_CODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: MPESA_CONFIG.BUSINESS_SHORT_CODE,
    PhoneNumber: phoneNumber,
    CallBackURL: MPESA_CONFIG.CALLBACK_URL,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  const response = await fetch(`${MPESA_CONFIG.BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return await response.json();
};

// Register URLs for C2B
export const registerC2BUrls = async (): Promise<any> => {
  const token = await getOAuthToken();

  const requestBody = {
    ShortCode: MPESA_CONFIG.BUSINESS_SHORT_CODE,
    ResponseType: 'Completed',
    ConfirmationURL: MPESA_CONFIG.CONFIRMATION_URL,
    ValidationURL: MPESA_CONFIG.VALIDATION_URL,
  };

  const response = await fetch(`${MPESA_CONFIG.BASE_URL}/mpesa/c2b/v1/registerurl`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  return await response.json();
};

export { MPESA_CONFIG };