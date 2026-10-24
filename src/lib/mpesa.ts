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
  if (error) {
    let message = error.message || 'Could not start PayHero payment';
    // Supabase wraps non-2xx Edge Function responses in FunctionsHttpError.
    // Its context is the original Response, which contains our safe JSON error.
    try {
      const response = (error as typeof error & { context?: Response }).context;
      if (response) {
        const payload = await response.clone().json();
        if (typeof payload?.error === 'string') message = payload.error;
        else if (typeof payload?.message === 'string') message = payload.message;
      }
    } catch {
      // Keep the SDK message when the response isn't JSON.
    }
    throw new Error(message);
  }
  return data as STKPushResponse;
};
