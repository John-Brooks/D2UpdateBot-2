import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType
} from 'discord-interactions';
import { getXurInventory, getVendorModInventory, refreshOauthToken } from './vendor-utils.js';
import { getAggregatedManifestFile } from './manifest-utils.js';
import { VerifyDiscordRequest, DiscordRequest } from './discord-utils.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (request, response) {
  // Interaction type and data
  const { type, id, data } = request.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return response.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;
  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId = data.custom_id;

  }
}
);


function getSnowFlakeID() {
  const DISCORD_EPOCH = 1420070400000;
  const d = new Date();
  var ms = d.getMilliseconds();
  console.log(ms);
  return (ms - DISCORD_EPOCH) << 22;
};

async function sendMessage() {
  // This is for retrieving the aggregated manifest file. It'll be saved locally, it's Fucking Hube, and it'll be ignored by Git
  // await getAggregatedManifestFile();

  var xurInventoryMessage = "Xur is selling:\r\n";
  // let xurItems = await getXurInventory();
  // xurItems.forEach(item => {
  //   xurInventoryMessage = xurInventoryMessage + item + "\r\n";
  // });
  // console.log(xurInventoryMessage);

  let bansheeItems = await getVendorModInventory('672118013');
  let bansheeMessage = 'Banshee-44: "What are ya buyin?"\r\n';
  let i = 1;
  bansheeItems.forEach(item => {
      bansheeMessage = bansheeMessage + `\r\n${i}.${item}`;
      i++;
    });

  var adaInventoryMessage = 'Ada-1: "I have wares if you have glimmer."\r\n';
  let adaItems = await getVendorModInventory('350061650');
  let j = 1;
  adaItems.forEach(item => {
    adaInventoryMessage = adaInventoryMessage + `\r\n${j}.${item}`;
    j++;
  });
  console.log(bansheeMessage);
  console.log(adaInventoryMessage);


  const discord_endpoint = `channels/${process.env.CHANNEL_ID}/messages`;  
  // DiscordRequest(discord_endpoint, {
  //     method: 'POST',
  //     body: {
  //       content: adaInventoryMessage,
  //     }
  //   }
  // );
};

sendMessage();

// app.listen(PORT, () => {
//   console.log('Listening on port', PORT);

//   // Check if guild commands from commands.json are installed (if not, install them)
//   HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
//     TEST_COMMAND,
//     CHALLENGE_COMMAND,
//   ]);
// });
