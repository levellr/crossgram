# Crossgram

Repost Tweets to Telegram automatically. Built by [Levellr](https://www.levellr.com).

## Configuration

The script is configured using environment variables.

The following environment variables are required, and the script will not start without them:

| Environment variable      | Description                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKENS`     | A comma-separated list of bot tokens for Telegram bots created via [@BotFather](https://t.me/botfather) |
| `TELEGRAM_CHAT_IDS`       | A comma-separated list of Telegram chat IDs to which the Tweets should be posted                        |
| `TWITTER_USERNAMES`       | A comma-separated list of Twitter usernames to watch and repost to Telegram                             |
| `TWITTER_CONSUMER_KEY`    | The consumer key for a Twitter API client                                                               |
| `TWITTER_CONSUMER_SECRET` | The consumer secret for a Twitter API client                                                            |

The environment variables `TELEGRAM_BOT_TOKENS` and `TELEGRAM_CHAT_IDS` must contain exactly one value each **or** exactly as many values as there are `TWITTER_USERNAMES`.

- If there is one bot token and one chat ID, all tweets from all usernames in `TWITTER_USERNAMES` will be streamed to the specified chat ID using the specified bot.
- If there are multiple bot tokens and chat IDs, the script will iterate through `TELEGRAM_BOT_TOKENS`, `TELEGRAM_CHAT_IDS` AND `TWITTER_USERNAMES`, matching them up. It will stream tweets from the first username to the first chat ID using the first bot token, the second username to the second chat ID using the second bot token, etc.

If specified in a `.env` file in the root of the project, environment variables will be automatically loaded at app start.

## Running the app

```bash
npm run start
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
