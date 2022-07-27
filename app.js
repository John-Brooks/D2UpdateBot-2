import 'dotenv/config';
import express from 'express';
import { getXurInventory, getVendorModInventory } from './utilities/vendor-utils.js';
import { getAggregatedManifestFile } from './utilities/manifest-utils.js';
import { VerifyDiscordRequest, DiscordRequest } from './utilities/discord-utils.js';

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

  if (timeOfDay === '13:5:1') {
    const bansheeItems = await getVendorModInventory('672118013');
    const adaItems = await getVendorModInventory('350061650');
    bansheeItems.forEach(item => {
      // compare list to missing mods  
    });
    adaItems.forEach(item => {
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

// while (true) {
//   await sendMessage();
// }

await sendMessage();
