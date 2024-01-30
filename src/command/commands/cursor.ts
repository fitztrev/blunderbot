import { CONFIG } from '../../config/config.service';
import { Platform } from '../../enums';

const command: Command = {
  name: 'cursor',
  platforms: [Platform.Twitch],
  run: async (ctx, { services }) => {
    const cursors = CONFIG.get().cursors;
    let cursor = (ctx.args[0] || '').toLowerCase();

    if (cursor === 'reset') {
      services.twitchGateway.sendDataToOneSocket('serverMessage', {
        type: 'CURSOR',
        cursor: '',
        user: ctx.displayName
      });
      return true;
    }

    if (cursor === 'random') {
      const filteredCursors = cursors.filter((k) => !k.startsWith('secret_'));
      cursor =
        filteredCursors[Math.floor(Math.random() * filteredCursors.length)];
    } else if (!cursor || !cursors.includes(cursor)) {
      ctx.botSpeak(
        `The following cursors are available: ${CONFIG.get()
          .cursors.filter((k) => !k.startsWith('secret_'))
          .join(', ')}`
      );
      return false;
    }
    const user = ctx.displayName;
    services.twitchGateway.sendDataToOneSocket('serverMessage', {
      type: 'CURSOR',
      cursor
    });
    if (!ctx.isOwner && !cursor.startsWith('secret_')) {
      void services.twitchService.ownerRunCommand(
        `!alert {${user}} changed the cursor to {${cursor}}`
      );
    }
  }
};

export default command;
