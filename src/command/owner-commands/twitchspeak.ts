import { Platform } from '../../enums';

const command: Command = {
  name: 'twitchspeak',
  ownerOnly: true,
  platforms: [Platform.Twitch, Platform.Discord],
  run: async (ctx, { services }) => {
    const msg = ctx.body;
    if (msg) {
      services.twitchService.botSpeak(msg);
    }
    return true;
  }
};

export default command;
