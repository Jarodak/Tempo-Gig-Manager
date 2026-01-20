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

    const placeId = event.queryStringParameters?.place_id ?? '';
    const sessionToken = event.queryStringParameters?.session_token ?? '';

    if (!placeId) {
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'place_id is required' }),
      };
    }

    const googleUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    googleUrl.searchParams.set('place_id', placeId);
    googleUrl.searchParams.set('key', apiKey);
    googleUrl.searchParams.set('fields', 'formatted_address,address_component,geometry,name');
    if (sessionToken) googleUrl.searchParams.set('sessiontoken', sessionToken);

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
