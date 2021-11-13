import { InputMediaPhoto, InputMediaVideo } from 'typegram';
import { Telegraf } from 'telegraf';
import { TweetV2SingleStreamResult } from 'twitter-api-v2';
import { TwitterLinkUnshortener } from './unshortener';

export class TweetDispatcher {
  private readonly botsByChatId: Map<number, Telegraf>;

  constructor() {
    this.botsByChatId = new Map<number, Telegraf>();
  }

  registerChat(chatId: number, bot: Telegraf) {
    this.botsByChatId.set(chatId, bot);
  }

  unregisterChat(chatId: number) {
    this.botsByChatId.delete(chatId);
  }

  async dispatch(streamResult: TweetV2SingleStreamResult) {
    // Expand shortlinks in the tweet and remove and superfluous media links
    const unprocessedTweet = streamResult.data.text;
    const text = await TwitterLinkUnshortener.unshortenLinks(unprocessedTweet);

    // Extract media from the tweet
    const mediaArray =
      TweetDispatcher.extractMediaArrayFromTweetStreamResult(streamResult);

    for (const chatId of this.botsByChatId.keys()) {
      // Get the relevant bot for the chat
      const bot = this.botsByChatId.get(chatId);
      if (!bot) {
        continue;
      }

      try {
        // Send media
        if (mediaArray.length > 0) {
          await bot.telegram.sendMediaGroup(chatId, mediaArray);
        }

        // Send the tweet text
        await bot.telegram.sendMessage(chatId, text);
      } catch (err) {
        console.log(`Error sending Tweet to chat ${chatId}: ${err}`);
      }
    }
  }

  static extractMediaArrayFromTweetStreamResult(
    streamResult: TweetV2SingleStreamResult,
  ): Array<InputMediaPhoto | InputMediaVideo> {
    if (
      !streamResult.includes?.media ||
      streamResult.includes.media.length === 0
    ) {
      return [];
    }

    const mediaArray: Array<InputMediaPhoto | InputMediaVideo> = [];

    for (const media of streamResult.includes.media) {
      if (media.url && (media.type === 'photo' || media.type === 'video')) {
        mediaArray.push({
          type: media.type,
          caption: media.alt_text,
          media: media.url,
        });
      }
    }

    return mediaArray;
  }
}
