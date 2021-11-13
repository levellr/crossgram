import fetch from 'node-fetch';

const TWITTER_MEDIA_TYPES: string[] = ['video', 'photo'];
const SHORTLINK_REGEX = /https\:\/\/t\.co\/\w+/g;

export class TwitterLinkUnshortener {
  static extractShortlinks(tweetText: string): string[] {
    return [...tweetText.matchAll(SHORTLINK_REGEX)].map((match) => match[0]);
  }

  static async unshortenLinks(tweetText: string): Promise<string> {
    const shortlinks = TwitterLinkUnshortener.extractShortlinks(tweetText);

    // Unshorten links if necessary
    for (const shortlink of shortlinks) {
      let url = await TwitterLinkUnshortener.unshortenLink(shortlink);

      // Check if the URL is an unnecessary pointer to embedded media (photo or video)
      if (TwitterLinkUnshortener.isTwitterMediaUrl(url)) {
        // Remove media URL rather than expand it
        url = '';
      }

      // Replace the shortened link with the full link
      tweetText = tweetText.replace(shortlink, url).trim();
    }

    return tweetText;
  }

  static async unshortenLink(shortlink: string): Promise<string> {
    // Only attempt to expand t.co shortlinks
    if (!shortlink.startsWith('https://t.co/')) {
      return shortlink;
    }

    // Expand the shortlinks by looking at the location (redirect) header
    let url: string | null = null;
    try {
      const response = await fetch(shortlink, {
        method: 'head',
        redirect: 'manual',
      });
      url = response.headers.get('location');
    } catch (err) {
      throw new Error(`Error fetching ${shortlink}: ${err}`);
    }

    if (!url) {
      throw new Error(`Request for URL ${shortlink} had no location header`);
    }

    return url;
  }

  static isTwitterMediaUrl(url: string): boolean {
    // Twitter media URLs start with the Twitter domain
    if (!url.startsWith('https://twitter.com/')) {
      return false;
    }

    // ...and they end in `/photo/1` or `/video/1`
    const parts = url.split('/');
    return TWITTER_MEDIA_TYPES.includes(parts[parts.length - 2]);
  }
}
