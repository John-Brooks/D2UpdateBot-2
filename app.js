import 'dotenv/config';
import { getXurInventory, getVendorModInventory, getProfileCollectibles} from './utilities/vendor-utils.js';
import { getAggregatedManifestFile } from './utilities/manifest-utils.js';
import { DiscordRequest } from './utilities/discord-utils.js';

async function sendMessage() {
  let time = new Date();
  const discord_endpoint = `channels/${process.env.CHANNEL_ID}/messages`;
  const timeOfDay = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
  const people = createGroup();

  for (const person of people) {
    const unownedModList = await getProfileCollectibles(person);
    if (unownedModList.length > 0) {
      await sendDiscordMessage();
    }
  }

  if (timeOfDay === '13:5:1') {
    for (const person of people) {
      const unownedModList = await getProfileCollectibles(person);
      if (unownedModList.length > 0) {
        await sendDiscordMessage();
      }
    }
  }
}

// while (true) {
//   await sendMessage();
// }

await sendMessage();

async function sendDiscordMessage() {
  let mention = '';
  mention = `<@${person.discordId}>`;
  mention = mention + '\r\nYou have these unowned mods for sale, grab them!';

  unownedModList.forEach(mod => {
    mention = mention + `\r\n${mod}`;
  });

  await DiscordRequest(discord_endpoint, {
    method: 'POST',
    body: {
      content: mention,
    }
  });
}

function createGroup() {
  const chase = {
    name: 'chase',
    profileId: '4611686018467377402',
    characterId: '2305843009752986497',
    discordId: '144989484994396160'
  };
  const john = {
    name: 'john',
    profileId: '4611686018468594461',
    characterId: '2305843009865754214',
    discordId: '150407958155624448'
  };
  //Hand Cannon Holster
  const kyle = {
    name: 'kyle',
    profileId: '4611686018509699433',
    characterId: '2305843010051954330',
    discordId: '267429975072833537'
  };
  // Overcharge Wellmaker
  const casey = {
    name: 'casey',
    profileId: '4611686018467439606',
    characterId: '2305843009395202985',
    discordId: '192797584497180672'
  };
  // Heavy Handed, Firepower

  return [chase, casey, kyle, john];
}

async function xur() {
  let xurInventoryMessage = "Xur is selling:\r\n";
  let xurItems = await getXurInventory();
  xurItems.forEach(item => {
    xurInventoryMessage = xurInventoryMessage + item + "\r\n";
  });
  return xurInventoryMessage;
}

async function aggregateFile() {
  return await getAggregatedManifestFile();
}