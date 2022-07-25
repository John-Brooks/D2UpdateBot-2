import 'dotenv/config';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { getItemFromManifest } from './manifest-utils.js';

export async function getXurInventory() {
  const search = {
    method: 'GET',
    components: '402'
  };
  const url = new URL('https://www.bungie.net/Platform/Destiny2/Vendors/');
  url.search = new URLSearchParams(search).toString();
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-Key': `${process.env.DESTINY_API_KEY}`
    }
  });
  const xurManifest = await response.json();
  const inventoryNameList = await getItemFromManifest(
    3,
    Object.values(Object.values(xurManifest.Response.sales.data)[0].saleItems)
  );
  return inventoryNameList;
}

export async function getVendorModInventory(vendorId) {
  const oauthToken = await refreshOauthToken();
  const vendorUrl = new URL('https://www.bungie.net/Platform/Destiny2/3/Profile/4611686018467377402/Character/2305843009752986497/Vendors/');
  const searchParams = {
    components: 402
  };
  vendorUrl.search = new URLSearchParams(searchParams).toString();
  const response = await fetch(vendorUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${oauthToken}`,
      'x-api-key': `${process.env.CHASE_API_KEY}`
    }
  });
  const destinyVendorInventories = await response.json();
  var vendorInventory;

  for(var key in destinyVendorInventories.Response.sales.data) {
    if (key === vendorId) {
      vendorInventory = destinyVendorInventories.Response.sales.data[key].saleItems;
    }
  }

  const modsForSale = await getItemFromManifest(19, vendorInventory);
  return modsForSale;
}

async function refreshOauthToken() {
  const getOauthCredentials = await fetch(new URL('https://www.bungie.net/platform/app/oauth/token/'), {
    method: 'POST',
    headers: {
      'x-api-key': `${process.env.CHASE_API_KEY}`
    },
    body: new URLSearchParams({
      'grant_type': 'refresh_token',
      'refresh_token': `${process.env.REFRESH_TOKEN}`,
      'client_id': `${process.env.CLIENT_ID}`,
      'client_secret': `${process.env.CLIENT_SECRET}`
    })
  });
  const oauthJson = await getOauthCredentials.json();
  process.env.REFRESH_TOKEN = oauthJson['refresh_token'];
  return oauthJson['access_token'];
}
