export const handler = async (event) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'Missing GOOGLE_MAPS_API_KEY' }),
      };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'POST required' }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : null;
    const addressLines = body?.address_lines;
    const regionCode = body?.region_code;

    if (!Array.isArray(addressLines) || addressLines.length === 0 || !regionCode) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'address_lines (array) and region_code are required' }),
      };
    }

    const googleUrl = new URL('https://addressvalidation.googleapis.com/v1:validateAddress');
    googleUrl.searchParams.set('key', apiKey);

    const resp = await fetch(googleUrl.toString(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        address: {
          regionCode,
          addressLines,
        },
      }),
    });

    const data = await resp.json();

    return {
      statusCode: resp.status,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (_err) {
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
