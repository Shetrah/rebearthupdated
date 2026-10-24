import { supabase } from './supabase';

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

/** Requests a PayHero M-Pesa STK prompt without exposing payment credentials in the browser. */
export const initiateSTKPush = async (
  phoneNumber: string,
  _amount: number,
  invoiceNumber: string,
  _transactionDesc: string,
  guestToken?: string,
): Promise<STKPushResponse> => {
  const { data, error } = await supabase.functions.invoke('payhero-stk', {
    body: { phoneNumber, invoiceNumber, guestToken },
  });
  if (error) throw new Error(error.message || 'Could not start PayHero payment');
  return data as STKPushResponse;
};
