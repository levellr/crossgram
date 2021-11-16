<p><a href="https://www.levellr.com">
  <img width="186" src="https://www.levellr.com/img/logos/wordmark-trimmed.png" alt="Levellr" />
</a></p>

# Crossgram

Repost Tweets to Telegram automatically. Built by [Levellr](https://www.levellr.com).

Crossgram is a TypeScript library and web service you can use to automatically repost Tweets to Telegram chats, groups, supergroups or channels using a Telegram Bot.

- Follow one Twitter account or many
- Reposts tweets into one Telegram chat or many
- Use a single Telegram bot, or use a different bot for each chat

A single Crossgram instance even can be used to stream Tweets from multiple accounts to multiple Telegram chats using multiple Telegram bots. For example, with a single instance you can repost:

- Tweets from [@city_xtra](https://twitter.com/city_xtra) to the [Manchester City - City Xtra](https://t.me/mancityxtra) supergroup via the "City Xtra on Twitter" bot
- Tweets from [@theanfieldwrap](https://twitter.com/theanfieldwrap) to the [Liverpool Football Club - The Anfield Wrap](https://t.me/liverpoolfctaw) supergroup via the "The Anfield Wrap on Twitter" bot
- Tweets from [@bbcnews](https://twitter.com/bbcnews) and [@guardiannews](https://twitter.com/guardiannews) to the [UK News Tweets](https://t.me/joinchat/erpa7xykf-gyZmNk) channel via the "UK News on Twitter" bot

Twitter shortlinks are automatically expanded — no more mysterious 't.co' links in your chat!

## Requirements

To get started, you'll need:

- A [Twitter API project](https://developer.twitter.com/en/docs/projects/overview), and specifically the consumer key and consumer secret from that project.
- A [Telegram Bot](https://core.telegram.org/bots), which can be created using [@BotFather](https://t.me/botfather)
- The Telegram chat ID for your channel, group or supergroup. See <https://stackoverflow.com/questions/33858927/how-to-obtain-the-chat-id-of-a-private-telegram-channel> for a guide on easily finding this ID.

Remember to add the bot to the channel, group or supergroup with permission to post content.

## Running Crossgram

Clone the project:

```bash
  git clone https://github.com/levellr/crossgram.git
```

Go to the project directory:

```bash
  cd crossgram
```

Install dependencies:

```bash
  npm install
```

Start the script:

```bash
  npm run start
```

## Deploying Crossgram to the web

Use a platform of your choice, or deploy in one click:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Configuration

The web service (via `npm run start` or `bin/stream.ts`) is configured using environment variables.

The following environment variables are required, and the script will not start without them:

| Environment variable      | Description                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKENS`     | A comma-separated list of bot tokens for Telegram bots created via [@BotFather](https://t.me/botfather) |
| `TELEGRAM_CHAT_IDS`       | A comma-separated list of Telegram chat IDs to which the Tweets should be posted                        |
| `TWITTER_USERNAMES`       | A comma-separated list of Twitter usernames to watch and repost to Telegram                             |
| `TWITTER_CONSUMER_KEY`    | The consumer key for a Twitter API client                                                               |
| `TWITTER_CONSUMER_SECRET` | The consumer secret for a Twitter API client                                                            |

The environment variable `TELEGRAM_CHAT_IDS` must contain either exactly one value **or** exactly as many values as there are `TWITTER_USERNAMES`.

- If there is one chat ID, all tweets from all usernames in `TWITTER_USERNAMES` will be streamed to the specified chat ID.
- If there are multiple chat IDs, the script will iterate through `TELEGRAM_CHAT_IDS` AND `TWITTER_USERNAMES` in a pairwise fashion. It will stream tweets from the first username to the first chat ID, the second username to the second chat ID, etc.

The environment variable `TELEGRAM_BOT_TOKENS` must contain either exactly one value **or** exactly as many values as there are `TELEGRAM_CHAT_IDS`.

- If there is one bot token, tweets destined for all chat IDs will be sent via the specified bot token.
- If there are multiple chat IDs, the script will iterate through `TELEGRAM_BOT_TOKENS` AND `TELEGRAM_CHAT_IDS` in a pairwise fashion. It will send tweets to the first chat ID using the first bot token, to the second chat ID using the second bot token, etc.

Neither chat IDs or bot tokens have to be unique.

If specified in a `.env` file in the root of the project, environment variables will be automatically loaded at app start.

## Using Crossgram as a library

Install Crossgram with npm:

```bash
  npm install @levellr/crossgram
```

Then use the library:

```javascript
const { TwitterStreamer } = require('@levellr/crossgram');

async function main() {
  console.log('Starting Twitter API client');

  const streamer = await TwitterStreamer.create({
    twitterAppKey: TWITTER_CONSUMER_KEY,
    twitterAppSecret: TWITTER_CONSUMER_SECRET,
  });

  // Register a stream from Twitter to Telegram
  console.log(`Registering stream`);
  await streamer.registerStream({
    twitterUsername: 'TWITTER_USERNAME',
    telegramBotToken: 'TELEGRAM_BOT_TOKEN',
    telegramChatId: 'TELEGRAM_CHAT_ID',
  });
}

main();
```

You can also use module imports:

```javascript
import { TwitterStreamer } from '@levellr/crossgram';
```

## Testing

```bash
  npm run test
```

## Code formatting and linting

```bash
# code linting with eslint
$ npm run lint

# formating with Prettier
$ npm run format
```

## License

Crossgram is open-source under the [GNU Affero General Public License Version 3 (AGPLv3)](https://choosealicense.com/licenses/agpl-3.0/).
