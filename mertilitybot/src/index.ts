import 'dotenv/config'
import * as config from './config.js'
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Sern, makeDependencies } from '@sern/handler';
import { Publisher } from '@sern/publisher';
import userSchema from "./models/user-schema.js";
import landSchema from "./models/land-schema.js";
import mongo from "mongoose";
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent, //Make sure this is enabled for text commands!
	],
  partials: [Partials.Channel],
});


/**
 * Where all of your dependencies are composed.
 * '@sern/client' is usually your Discord Client.
 * Use this function to access all of your dependencies.
 * This is used for external event modules as well
 */
await makeDependencies(({ add }) => {
    add('@sern/client', client);
    add('publisher', deps => new Publisher(
        deps['@sern/modules'],
        deps['@sern/emitter'],
        deps['@sern/logger']!
    ));
});

//View docs for all options
Sern.init(config);

client.on("ready", async (c) => {
    await mongo.connect(process.env.MONGOURI!);
    const connStatus = mongo.connection.readyState;
    if (connStatus == 1) {
      console.log(`${c.user.username} has connected.`);
    } else {
      console.log(`Status is ${connStatus}`);
    }
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    const target = message.member!;
    const roleIds = new Set([
      "830604135748337678",
      "830604878190870538",
      "830604824763695124",
    ]);
    const roles = target.roles.cache.filter((r) => roleIds.has(r.id));
    const landName = roles.map((r) => r.name).toString();

    const tLand = await landSchema.find({name: landName})
  
    let profileData;
    try {
      profileData = await userSchema.findOne({ userID: message.author.id });
      if (!profileData) {
        let profile = await userSchema.create({
          userName: message.author.username,
          userID: message.author.id,
          nickName: message.member?.displayName,
          emojis: tLand.map((m) => m.emojiID),
          land: landName,
          serverID: message.guildId,
        });
        profile.save();
      }
    } catch (err) {
      console.log(err);
      console.log('this error')
    }

    const profile = await userSchema.find({userID: message.author.id})
    const cNick = message.member!.nickname

    if(profile){
      for (const results of profile)
      {
        const {nickName, emojis} = results
        const nNick = `${nickName||emojis}`
        if(nNick != cNick){message.member?.setNickname(`${nickName}${emojis}, ''`)}
        else{return;}
      }
    }

  });

await client.login(process.env.DISCORD_TOKEN);
