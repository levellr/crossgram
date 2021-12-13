import { TwitterStreamer } from '../src/streamer';
import { config as dotenvConfig } from 'dotenv';
import { env, exit } from 'process';

dotenvConfig();

async function startStreamer() {
  console.log('Starting Twitter API client');

  const streamer = await TwitterStreamer.create({
    twitterAppKey: TWITTER_CONSUMER_KEY,
    twitterAppSecret: TWITTER_CONSUMER_SECRET,
  });

  console.log(
    `Registering streams for ${TWITTER_USERNAMES.length} Twitter username to ${TELEGRAM_CHAT_IDS.length} Telegram chats via ${TELEGRAM_BOT_TOKENS.length} Telegram bots`,
  );

  if (TELEGRAM_CHAT_IDS.length === 1 && TWITTER_USERNAMES.length > 1) {
    TELEGRAM_CHAT_IDS.push(
      ...Array(TWITTER_USERNAMES.length - 1).fill(TELEGRAM_CHAT_IDS[0]),
    );
  }

  if (TELEGRAM_BOT_TOKENS.length === 1 && TELEGRAM_CHAT_IDS.length > 1) {
    TELEGRAM_BOT_TOKENS.push(
      ...Array(TELEGRAM_CHAT_IDS.length - 1).fill(TELEGRAM_BOT_TOKENS[0]),
    );
  }

  for (let i = 0; i < TWITTER_USERNAMES.length; i++) {
    try {
      console.log(
        `Registering stream to repost tweets from @${TWITTER_USERNAMES[i]} to Telegram chat ID ${TELEGRAM_CHAT_IDS[i]} via Telegram bot ${TELEGRAM_BOT_TOKENS[i]}`,
      );
      await streamer.registerStream({
        twitterUsername: TWITTER_USERNAMES[i],
        telegramBotToken: TELEGRAM_BOT_TOKENS[i],
        telegramChatId: TELEGRAM_CHAT_IDS[i],
      });
    } catch (err) {
      console.log(err);
    }
  }
}
const TWITTER_CONSUMER_KEY = env['TWITTER_CONSUMER_KEY'] ?? '';
const TWITTER_CONSUMER_SECRET = env['TWITTER_CONSUMER_SECRET'] ?? '';
const TELEGRAM_BOT_TOKENS = (env['TELEGRAM_BOT_TOKENS'] ?? '')
  .split(',')
  .map((u) => u.trim());
const TELEGRAM_CHAT_IDS = (env['TELEGRAM_CHAT_IDS'] ?? '')
  .split(',')
  .map((u) => u.trim());
const TWITTER_USERNAMES = (env['TWITTER_USERNAMES'] ?? '')
  .split(',')
  .map((u) => u.trim());

const missingEnvironmentVariables: string[] = [];

if (!TWITTER_CONSUMER_KEY) {
  missingEnvironmentVariables.push('TWITTER_CONSUMER_KEY');
}
if (!TWITTER_CONSUMER_SECRET) {
  missingEnvironmentVariables.push('TWITTER_CONSUMER_SECRET');
}
if (TELEGRAM_BOT_TOKENS.length === 0) {
  missingEnvironmentVariables.push('TELEGRAM_BOT_TOKENS');
}
if (TELEGRAM_CHAT_IDS.length === 0) {
  missingEnvironmentVariables.push('TELEGRAM_CHAT_IDS');
}
if (TWITTER_USERNAMES.length === 0) {
  missingEnvironmentVariables.push('TWITTER_USERNAMES');
}

if (missingEnvironmentVariables.length > 0) {
  console.log(
    `Environment variable${
      missingEnvironmentVariables.length !== 1 ? 's' : ''
    } ${missingEnvironmentVariables.join(
      ', ',
    )} are required but not provided, exiting...`,
  );
  exit(1);
}

if (
  TELEGRAM_CHAT_IDS.length !== 1 &&
  TELEGRAM_CHAT_IDS.length !== TWITTER_USERNAMES.length
) {
  console.log(
    `The number of Twitter usernames (${TWITTER_USERNAMES.length}) and Telegram chat IDs (${TELEGRAM_CHAT_IDS.length}) does not match, exiting...`,
  );
  exit(1);
}

if (
  TELEGRAM_BOT_TOKENS.length !== 1 &&
  TELEGRAM_BOT_TOKENS.length !== TELEGRAM_CHAT_IDS.length
) {
  console.log(
    `The number of Telegram chat IDs (${TELEGRAM_CHAT_IDS.length}) and Telegram bot tokens (${TELEGRAM_BOT_TOKENS.length}) does not match, exiting...`,
  );
  exit(1);
}

startStreamer();
