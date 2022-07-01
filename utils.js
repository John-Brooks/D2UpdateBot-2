import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';
import { createRequire } from 'module';
import { response } from 'express';
import * as oldfs from "fs";
import { URLSearchParams } from 'url';
const require = createRequire(import.meta.url);
const fs = require('fs');
const fsPromises = fs.promises;

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function DestinyRequest(endpoint, search) {
  // append endpoint to root API URL
  const url = new URL('https://www.bungie.net/Platform/' + endpoint);
  url.search = new URLSearchParams(search).toString();
  console.log(endpoint)
  // Use node-fetch to make requests
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-Key": `${process.env.DESTINY_API_KEY}`,
    },
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.text;
    console.log(data);
    console.log(res.status);
    throw new Error("Error response from D2 Server");
  }

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
  return res;
}

export async function getXurInventory() {
  const search = {
    method: 'GET',
    components: "402"
  };
  const url = new URL('https://www.bungie.net/Platform/Destiny2/Vendors/');
  url.search = new URLSearchParams(search).toString();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-Key": `${process.env.DESTINY_API_KEY}`
    }
  });
  const xurManifest = await response.json();
  const inventory = Object.values(Object.values(xurManifest.Response.sales.data)[0].saleItems);
  const inventoryNameList = await getItemFromManifest(inventory);

  return inventoryNameList;
}

export async function getItemFromManifest(itemList) {
  var inventoryNameList = [];
  const manifestFileName = await getManifestFile();
  const itemManifestFileName = "manifest-items.json";

  await fetch('https://www.bungie.net' + manifestFileName)
    .then(response => response.json())
    .then(async data => {
      inventoryNameList = await getCollectiblesFromManifest(
        itemManifestFileName,
        inventoryNameList,
        itemList,
        data
      );
    });

  return inventoryNameList;
}

async function getCollectiblesFromManifest(fileName, inventoryNameList, itemList, data) {
  try {
    await fsPromises.access(fileName, oldfs.constants.F_OK);
    inventoryNameList = await readFile(fileName, itemList, inventoryNameList);
  } catch (error) {
    inventoryNameList = await writeFile(fileName, data.DestinyInventoryItemDefinition, itemList, inventoryNameList);
  }
  return inventoryNameList;
}

export async function getAggregatedManifestFile(data) {
  const manifestFileName = await getManifestFile();
  const aggregateFileName = manifestFileName.split("/")[5];

  await fetch('https://www.bungie.net' + manifestFileName)
    .then(response => response.json())
    .then(async data => {
      await fsPromises.writeFile(aggregateFileName, JSON.stringify(data))
        .catch((error) => {
          console.log("Error while writing the aggregated manifest file!");
          throw (error);
        });
    });
}

async function getManifestFile() {
  const manifest = await fetch(new URL('https://www.bungie.net/Platform/Destiny2/Manifest/'), {
    method: "GET",
    headers: {
      "X-API-Key": `${process.env.DESTINY_API_KEY}`
    }
  });
  const manifestJson = await manifest.json();

  return manifestJson.Response.jsonWorldContentPaths.en;
}

async function readFile(fileName, itemList, inventoryNameList) {
  await fsPromises.readFile(fileName)
    .then((fileContents) => {
      inventoryNameList = getItemName(itemList, JSON.parse(fileContents));
    })
    .catch((error) => {
      console.log("Error reading file!");
      throw (error);
    })

  return inventoryNameList;
}

async function writeFile(fileName, manifestData, itemHashId, inventoryNameList) {
  await fsPromises.writeFile(fileName, JSON.stringify(manifestData))
    .then(() => {
      inventoryNameList = getItemName(itemHashId, manifestData);
    })
    .catch((error) => {
      console.log("Error while writing!");
      throw (error);
    })

  return inventoryNameList;
}

async function getItemName(inventoryItemList, manifest) {
  var itemNameList = [];
  const manifestKeys = Object.keys(manifest);
  const itemListValues = Object.values(inventoryItemList);
  const itemHashList = [];

  itemListValues.forEach(item => {
    itemHashList.push(item.itemHash);
  });

  for (var i = 0; i < manifestKeys.length; i++) {
    if (canManifestItemBeAdded(itemHashList, manifest, manifestKeys, i, itemNameList)) {
      itemNameList.push(manifest[manifestKeys[i]].displayProperties.name);
    }
  }

  return itemNameList;
}

function canManifestItemBeAdded(itemHashList, manifest, manifestKeys, index, itemNameList) {
  return itemHashList.includes(manifest[manifestKeys[index]].hash) &&
    manifest[manifestKeys[index]].itemType == 3 &&
    !itemNameList.includes(manifest[manifestKeys[index]].displayProperties.name);
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
