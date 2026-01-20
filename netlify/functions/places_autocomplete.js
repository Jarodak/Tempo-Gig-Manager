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

    const input = event.queryStringParameters?.input ?? '';
    const sessionToken = event.queryStringParameters?.session_token ?? '';
    const country = (event.queryStringParameters?.country ?? 'us').toLowerCase();

    if (!input || input.trim().length < 3) {
      return {
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ predictions: [] }),
      };
    }

    if (!sessionToken) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'session_token is required' }),
      };
    }

    const googleUrl = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    googleUrl.searchParams.set('input', input);
    googleUrl.searchParams.set('sessiontoken', sessionToken);
    googleUrl.searchParams.set('key', apiKey);
    googleUrl.searchParams.set('components', `country:${country}`);

    const resp = await fetch(googleUrl.toString());
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
