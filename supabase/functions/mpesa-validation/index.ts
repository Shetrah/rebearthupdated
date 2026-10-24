// If running in Deno, ensure your editor supports Deno and Deno extension is enabled.
// If running in Node.js, use the built-in http module instead:
import http from 'http';

// Replace Deno's serve with Node.js http.createServer
const serve = (handler: (req: Request) => Promise<Response>) => {
  const server = http.createServer(async (req, res) => {
    // Convert Node.js req to Fetch API Request
    const url = `http://${req.headers.host}${req.url}`;
    const body: Buffer[] = [];
    req.on('data', (chunk: Buffer) => body.push(chunk));
    req.on('end', async () => {
      const request = new Request(url, {
        method: req.method,
        headers: req.headers as any,
        body: body.length ? Buffer.concat(body) : undefined,
      });
      const response = await handler(request);
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
      const respBody = await response.text();
      res.end(respBody);
    });
  });
  server.listen(8000, () => {
    console.log('Server running on http://localhost:8000');
  });
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const validationData = await req.json()
    console.log('M-Pesa Validation received:', JSON.stringify(validationData, null, 2))

    // Extract validation data
    const {
      TransactionType,
      TransID,
      TransTime,
      TransAmount,
      BusinessShortCode,
      BillRefNumber,
      InvoiceNumber,
      OrgAccountBalance,
      ThirdPartyTransID,
      MSISDN,
      FirstName,
      MiddleName,
      LastName
    } = validationData

    // Perform validation logic here
    // For example, check if the BillRefNumber (invoice number) exists
    // Check if the amount is correct, etc.

    // For now, we'll accept all transactions
    // You can add your custom validation logic here

    console.log('Validation successful for transaction:', TransID)

    return new Response(
      JSON.stringify({
        ResultCode: '0',
        ResultDesc: 'Accepted'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in M-Pesa validation:', error)
    return new Response(
      JSON.stringify({
        ResultCode: 'C2B00011',
        ResultDesc: 'Rejected'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})