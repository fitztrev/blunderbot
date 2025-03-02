import fetch from 'node-fetch';
import { ENV } from '../../config/config.service';
import { Platform } from '../../enums';

const command: Command = {
  name: 'rating',
  aliases: ['elo'],
  help: "!rating <username> - Get a user's lichess rating",
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx) => {
    let user = ctx.args[0];
    if (!user) {
      user = ENV.LICHESS_USER;
    }
    try {
      const res = await fetch(`https://lichess.org/api/user/${user}`);
      const json = await res.json();

      let dt: any = new Date(json.createdAt);
      dt = dt.getMonth() + 1 + '/' + dt.getDate() + '/' + dt.getFullYear();

      const { rapid, blitz, classical, bullet, puzzle } = json.perfs;

      let reply = `${user} is a lichess member since ${dt}. \n`;
      reply += rapid ? `rapid: ${rapid.rating} (${rapid.games}g), \n` : '';
      reply += blitz ? `blitz: ${blitz.rating} (${blitz.games}g), \n` : '';
      reply += classical
        ? `classical: ${classical.rating} (${classical.games}g), \n`
        : '';
      reply += bullet ? `bullet: ${bullet.rating} (${bullet.games}g), \n` : '';
      reply += puzzle ? `puzzle rating: ${puzzle.rating}, \n` : '';
      reply += `https://lichess.org/@/${user}`;
      ctx.botSpeak(reply);
    } catch (e) {
      ctx.botSpeak(`There was a problem trying to fetch ${user}'s ratings.`);
      console.log(`Error getting rating for ${user}`);
      console.log(e);
    }
    return true;
  }
};

export default command;
