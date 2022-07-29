import 'dotenv/config';
import express from 'express';
import { getXurInventory, getVendorModInventory } from './utilities/vendor-utils.js';
import { getAggregatedManifestFile } from './utilities/manifest-utils.js';
import { DiscordRequest } from './utilities/discord-utils.js';

const app = express();

async function sendMessage() {
  // This is for retrieving the aggregated manifest file. It'll be saved locally, it's Fucking Huge, and it'll be ignored by Git.
  // await getAggregatedManifestFile();

  var xurInventoryMessage = "Xur is selling:\r\n";
  // let xurItems = await getXurInventory();
  // xurItems.forEach(item => {
  //   xurInventoryMessage = xurInventoryMessage + item + "\r\n";
  // });
  // console.log(xurInventoryMessage);
  
  const discord_endpoint = `channels/${process.env.CHANNEL_ID}/messages`;
  var time = new Date();
  const timeOfDay = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

  // const mention = '<@144989484994396160> TESTING 123';
  // await DiscordRequest(discord_endpoint, {
  //   method: 'POST',
  //   body: {
  //     content: mention,
  //   }
  // });

  // 123185593 combat style nodes

  if (timeOfDay === '13:5:1') {
    let bansheeItems = await getVendorModInventory('672118013');
    let bansheeMessage = 'Banshee-44: "What are ya buyin?"';
    let i = 1;
    const adaItems = await getVendorModInventory('350061650');
    var adaInventoryMessage = 'Ada-1: "I have wares if you have glimmer."';
    let j = 1;
    bansheeItems.forEach(item => {
      bansheeMessage = bansheeMessage + `\r\n${i}.${item}`;
        i++;
    });
    adaItems.forEach(item => {
      adaInventoryMessage = adaInventoryMessage + `\r\n${j}.${item}`;
      j++;
    });
    const discordMessage = `${bansheeMessage}\r\n\r\n${adaInventoryMessage}`;
    await DiscordRequest(discord_endpoint, {
      method: 'POST',
      body: {
        content: discordMessage,
      }
    });
  }
}

while (true) {
  await sendMessage();
}

// await sendMessage();
