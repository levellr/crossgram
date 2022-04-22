import TwitterApi, {
  ETwitterStreamEvent,
  StreamingV2Rule,
  TweetStream,
  TweetV2SingleStreamResult,
} from 'twitter-api-v2';
import { Telegraf } from 'telegraf';
import { TweetDispatcher } from './dispatcher';
import { exit } from 'process';

export type TwitterStreamParams = {
  appKey: string;
  appSecret: string;
  resetRules?: boolean;
};

export type TwitterClientAndStream = {
  twitter: TwitterApi;
  stream: TweetStream<TweetV2SingleStreamResult>;
};
export type TwitterConnectionFactory = () => Promise<TwitterClientAndStream>;

export class TwitterStreamer {
  private readonly userIdsByUsername: Map<string, string>;
  private readonly botsByToken: Map<string, Telegraf>;
  private readonly dispatchers: Map<string, TweetDispatcher>;
  private rules?: StreamingV2Rule[];

  constructor(
    private twitter: TwitterApi,
    stream: TweetStream<TweetV2SingleStreamResult>,
  ) {
    this.userIdsByUsername = new Map<string, string>();
    this.botsByToken = new Map<string, Telegraf>();
    this.dispatchers = new Map<string, TweetDispatcher>();
    this.twitter = twitter;

    stream.autoReconnect = true;
    stream.on(ETwitterStreamEvent.Data, this.processStreamEvent);
    stream.on(ETwitterStreamEvent.ConnectionError, (err: Error) => {
      console.log(err);
      console.log('Connection error, exiting');
      exit(1);
    });
    stream.on(ETwitterStreamEvent.ConnectionClosed, () => {
      console.log('Connection has been closed, exiting');
      exit(1);
    });
    stream.on(ETwitterStreamEvent.Data, this.processStreamEvent);
  }

  async registerStream(params: {
    twitterUsername: string;
    telegramBotToken: string;
    telegramChatId: string | number;
  }): Promise<void> {
    const { twitterUsername, telegramBotToken } = params;
    let { telegramChatId } = params;

    // Convert Telegram chat ID to numeric ID if necessary
    if (typeof telegramChatId === 'string') {
      const numericTelegramChatId = parseInt(telegramChatId);
      if (Number.isNaN(numericTelegramChatId)) {
        throw new Error(`Invalid Telegram chat ID ${telegramChatId}`);
      }
      telegramChatId = numericTelegramChatId;
    }

    // Get Twitter numeric user ID
    const user = await this.twitter.v2.userByUsername(twitterUsername);
    if (!user.data) {
      throw new Error(`No Twitter user found with username ${twitterUsername}`);
    }

    // Store user ID for username for later
    this.userIdsByUsername.set(twitterUsername, user.data.id);

    let dispatcher = this.dispatchers.get(user.data.id);

    // Register dispatcher for the Twitter user if necessary
    if (!dispatcher) {
      dispatcher = new TweetDispatcher();
      this.dispatchers.set(user.data.id, dispatcher);
    }

    let bot = this.botsByToken.get(telegramBotToken);

    // Register bot for token if necessary
    if (!bot) {
      bot = new Telegraf(telegramBotToken);
      await bot.launch();
      this.botsByToken.set(telegramBotToken, bot);
    }

    dispatcher.registerChat(telegramChatId, bot);

    await this.updateStreamRules(twitterUsername);

    return;
  }

  unregisterStream(params: { username: string; chatId: number }) {
    const { username, chatId } = params;
    const userId = this.userIdsByUsername.get(username);

    // No known user ID for this username? Nothing to unregister.
    if (!userId) {
      return;
    }

    const dispatcher = this.dispatchers.get(userId);

    // No known dispatcher for this user ID? Nothing to unregister.
    if (!dispatcher) {
      return;
    }

    dispatcher.unregisterChat(chatId);

    return;
  }

  private async updateStreamRules(twitterUsername: string): Promise<void> {
    const rule = this.rules?.find(
      (rule: StreamingV2Rule) => rule.tag === twitterUsername,
    );

    if (!rule) {
      // Update Twitter stream rules to monitor for this user
      await this.twitter.v2.updateStreamRules({
        add: [
          {
            tag: twitterUsername,
            value: `from:${twitterUsername} -is:retweet -is:quote -is:reply`,
          },
        ],
      });
    }

    const streamRulesResult = await this.twitter.v2.streamRules();
    this.rules = streamRulesResult.data;
    return;
  }

  private processStreamEvent = async (
    result: TweetV2SingleStreamResult,
  ): Promise<void> => {
    // If there's no tweet author user ID, it's not a relevant tweet
    if (!result.data.author_id) {
      return;
    }

    const dispatcher = this.dispatchers.get(result.data.author_id);

    // If there's no registered dispatcher for the user, it's not a relevant tweet
    if (!dispatcher) {
      return;
    }

    // Repost the tweet
    return dispatcher.dispatch(result);
  };

  static async create(params: TwitterStreamParams): Promise<TwitterStreamer> {
    const { resetRules, ...auth } = params;
    const twitterConsumerClient = new TwitterApi(auth);
    const twitter = await twitterConsumerClient.appLogin();

    if (resetRules) {
      const rules = await twitter.v2.streamRules();
      await twitter.v2.updateStreamRules({
        delete: { ids: rules.data.map((rule) => rule.id) },
      });
    }

    const stream = await twitter.v2.searchStream({
      expansions: [
        'author_id',
        'attachments.media_keys',
        'attachments.poll_ids',
      ],
      'media.fields': ['preview_image_url', 'url', 'alt_text'],
    });

    return new TwitterStreamer(twitter, stream);
  }
}
