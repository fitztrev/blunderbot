import { readdirSync } from 'fs';
// import * as yaml from 'js-yaml';
import {
  getRandomElement,
  removeSymbols,
  requireUncached
} from '../utils/utils';
import { Platform } from '../enums';
import * as path from 'path';

function getCommandProperties(obj: MessageCommand, name: string): Command {
  return {
    name,
    ownerOnly: obj.ownerOnly,
    aliases: obj.aliases,
    platforms: obj.platforms || [Platform.Twitch, Platform.Discord],
    ownerRunCommands: obj.ownerRunCommands,
    run: (ctx: Context, { services }) => {
      if (obj.commands) {
        obj.commands.forEach((command: string) => {
          if (ctx.platform === Platform.Twitch) {
            command = command.replace(
              /{username}/g,
              removeSymbols(ctx.tags['display-name'])
            );
            void services.twitchService.ownerRunCommand(command, {
              onBehalfOf: ctx.tags['display-name']
            });
          }
        });
      }
      if (obj.message) {
        ctx.botSpeak(obj.message);
      }
      return true;
    },
    coolDown: 2000
  };
}

class ConfigService {
  loadedConfig: Partial<Config> = {};
  constructor() {
    this.loadConfig();
  }

  loadFromFile(configKey, filePath) {
    try {
      this.loadedConfig[configKey] = requireUncached(
        path.join(__dirname, filePath)
      ).default;
    } catch (e) {
      console.log(`No config file: ${filePath} [skipping]`);
    }
  }

  loadConfig() {
    this.loadedConfig = requireUncached(
      path.join(__dirname, './config')
    ).default;

    // If either of these fail, that's fatal
    this.loadedConfig.twitch = requireUncached(
      path.join(__dirname, './config.twitch')
    ).default;
    this.loadedConfig.lichess = requireUncached(
      path.join(__dirname, './config.lichess')
    ).default;

    // These are optional and can fail to load
    this.loadFromFile('autoCommands', './config.auto-commands');
    this.loadFromFile('autoResponder', './config.auto-responder');
    this.loadFromFile('autoShoutouts', './config.auto-shoutouts');
    this.loadFromFile('bits', './config.bits');
    this.loadFromFile('discord', './config.discord');
    this.loadFromFile('messageCommands', './config.message-commands');
    this.loadFromFile('openai', './config.openai');
    this.loadFromFile('raids', './config.raids');
    this.loadFromFile('titledPlayers', './config.titled-players');
    this.loadFromFile('trivia', './config.trivia');
    this.loadFromFile('twitter', './config.twitter');

    console.log(
      requireUncached(path.join(__dirname, './config.titled-players')).default
    );

    // Load the public files
    this.loadedConfig.kings = [];
    this.loadedConfig.crowns = [];
    this.loadedConfig.oppKings = [];
    this.loadedConfig.soundboard = [];
    this.loadedConfig.cursors = [];
    [
      ['./public/images/kings', this.loadedConfig.kings],
      ['./public/images/crowns', this.loadedConfig.crowns],
      ['./public/images/opponents', this.loadedConfig.oppKings],
      ['./public/sounds/soundboard', this.loadedConfig.soundboard],
      ['./public/images/cursors', this.loadedConfig.cursors]
    ].forEach((publicFiles: [string, string[]]) => {
      readdirSync(publicFiles[0]).forEach((file) => {
        const fileName = file.split('.')[0];
        publicFiles[1].push(fileName);
      });
    });

    this.loadedConfig.themeConfig = {};
    readdirSync('./public/images/themes').forEach((theme) => {
      this.loadedConfig.themeConfig[theme] = {};

      readdirSync(`./public/images/themes/${theme}`).forEach((dir) => {
        if (dir === 'board.png') {
          this.loadedConfig.themeConfig[theme].boardExists = true;
        } else {
          this.loadedConfig.themeConfig[theme][dir] = {};
          readdirSync(`./public/images/themes/${theme}/${dir}`).forEach(
            (file) => {
              const fileName = file.split('.')[0];
              this.loadedConfig.themeConfig[theme][dir][fileName] = true;
            }
          );
        }
      });
    });

    this.loadCommands();
    console.log('Config loaded');
  }

  private loadCommands() {
    const messageCommands = {};
    const messageCommandsConfig = this.loadedConfig.messageCommands || {};
    Object.keys(messageCommandsConfig).forEach((key) => {
      messageCommands[key] = getCommandProperties(
        messageCommandsConfig[key],
        key
      );
    });

    this.loadedConfig.commands = {
      ...messageCommands
    };

    const MOD_DIR = './src/command/mod-commands';
    const OWNER_DIR = './src/command/owner-commands';

    const dirImports = [
      ['./src/command/commands', '../command/commands/'],
      [MOD_DIR, '../command/mod-commands/'],
      [OWNER_DIR, '../command/owner-commands/']
    ];

    //
    dirImports.forEach((dir) => {
      readdirSync(dir[0]).forEach((file) => {
        const fileName = file.split('.')[0];
        if (fileName !== 'index') {
          this.loadedConfig.commands[fileName] = require(
            `${dir[1]}${fileName}`
          ).default;
          if (dir[0] === MOD_DIR) {
            this.loadedConfig.commands[fileName].modOnly = true;
          } else if (dir[0] === OWNER_DIR) {
            this.loadedConfig.commands[fileName].ownerOnly = true;
          }
        }
      });
    });
  }

  public get() {
    return this.loadedConfig;
  }

  public getRandomRapidApiKey() {
    return getRandomElement(CONFIG.get().rapidApi?.keys);
  }
}

const CONFIG = new ConfigService();

export { CONFIG };
