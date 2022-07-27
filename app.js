import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { getXurInventory, getVendorModInventory } from './utilities/vendor-utils.js';
import { getAggregatedManifestFile } from './utilities/manifest-utils.js';
import { VerifyDiscordRequest, DiscordRequest } from './utilities/discord-utils.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

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

  // need to detect when the inventory has been refreshed
  if (timeOfDay === '13:5:1') {
    flag = true;
    let bansheeItems = await getVendorModInventory('672118013');
    let bansheeMessage = 'Banshee-44: "What are ya buyin?"';
    let i = 1;
    bansheeItems.forEach(item => {
        bansheeMessage = bansheeMessage + `\r\n${i}.${item}`;
        i++;
      });
    var adaInventoryMessage = 'Ada-1: "I have wares if you have glimmer."';
    let adaItems = await getVendorModInventory('350061650');
    let j = 1;
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

// app.listen(PORT, () => {
//   console.log('Listening on port', PORT);

//   // Check if guild commands from commands.json are installed (if not, install them)
//   HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
//     TEST_COMMAND,
//     CHALLENGE_COMMAND,
//   ]);
// });
