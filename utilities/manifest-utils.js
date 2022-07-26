import * as oldfs from 'fs';
import {createRequire} from 'module';
import fetch from 'node-fetch';

const require = createRequire(import.meta.url);
const fs = require('fs');
const fsPromises = fs.promises;

export async function getItemFromManifest(itemType, itemList) {
    var inventoryNameList = [];
    const manifestFileName = await getManifestFile();
    const itemManifestFileName = 'manifest-items.json';
  
    await fetch('https://www.bungie.net' + manifestFileName)
      .then(async data => {
        inventoryNameList = await getCollectiblesFromManifest(
            itemType,
            itemManifestFileName,
            inventoryNameList,
            itemList,
            data
        );
      });
  
    return inventoryNameList;
  }

  async function getCollectiblesFromManifest(itemType, fileName, inventoryNameList, itemList, data) {
    try {
      await fsPromises.access(fileName, oldfs.constants.F_OK);
      inventoryNameList = await readFile(itemType, fileName, itemList, inventoryNameList);
    } catch (error) {
      inventoryNameList = await writeFile(itemType, fileName, data.DestinyInventoryItemDefinition, itemList, inventoryNameList);
    }
    return inventoryNameList;
  }

  async function getManifestFile() {
    const manifest = await fetch(new URL('https://www.bungie.net/Platform/Destiny2/Manifest/'), {
      method: 'GET',
      headers: {
        'X-API-Key': `${process.env.DESTINY_API_KEY}`
      }
    });
    const manifestJson = await manifest.json();
  
    return manifestJson.Response.jsonWorldContentPaths.en;
  }
  
  async function readFile(itemType, fileName, itemList, inventoryNameList) {
    await fsPromises.readFile(fileName)
      .then((fileContents) => {
        inventoryNameList = getItemName(itemType, itemList, JSON.parse(fileContents));
      })
      .catch((error) => {
        console.log('Error reading file!');
        throw (error);
      })
  
    return inventoryNameList;
  }
  
  async function writeFile(itemType, fileName, manifestData, itemList, inventoryNameList) {
    await fsPromises.writeFile(fileName, JSON.stringify(manifestData))
      .then(() => {
        inventoryNameList = getItemName(itemType, itemList, manifestData);
      })
      .catch((error) => {
        console.log('Error while writing!');
        throw (error);
      })
  
    return inventoryNameList;
  }

  function getItemName(itemType, inventoryItemList, manifest) {
    var itemNameList = [];
    const manifestKeys = Object.keys(manifest);
    const itemListValues = Object.values(inventoryItemList);
    const itemHashList = [];
  
    itemListValues.forEach(item => {
      itemHashList.push(item.itemHash);
    });
  
    for (var i = 0; i < manifestKeys.length; i++) {
      if (canManifestItemBeAdded(itemType, itemHashList, manifest, manifestKeys, i, itemNameList)) {
        itemNameList.push(manifest[manifestKeys[i]].displayProperties.name);
      }
    }
  
    return itemNameList;
  }

  function canManifestItemBeAdded(itemType, itemHashList, manifest, manifestKeys, index, itemNameList) {
    return itemHashList.includes(manifest[manifestKeys[index]].hash) &&
      manifest[manifestKeys[index]].itemType == itemType &&
      !itemNameList.includes(manifest[manifestKeys[index]].displayProperties.name);
  }

  export async function getAggregatedManifestFile() {
    const manifestFileName = await getManifestFile();
    const aggregateFileName = manifestFileName.split('/')[5];
  
    await fetch('https://www.bungie.net' + manifestFileName)
      .then(response => response.json())
      .then(async data => {
        await fsPromises.writeFile(aggregateFileName, JSON.stringify(data))
          .catch((error) => {
            console.log('Error while writing the aggregated manifest file!');
            throw (error);
          });
      });
  }
