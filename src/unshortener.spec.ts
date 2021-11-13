import { TwitterLinkUnshortener } from './unshortener';

describe('TwitterLinkUnshortener', () => {
  describe('extractShortlinks', () => {
    it('surrounded by space', async () => {
      expect(
        TwitterLinkUnshortener.extractShortlinks(` https://t.co/gJzevaFrrN `),
      ).toStrictEqual(['https://t.co/gJzevaFrrN']);
    });

    it('surrounded by emoji', async () => {
      expect(
        TwitterLinkUnshortener.extractShortlinks(`🥁https://t.co/gJzevaFrrN🥁`),
      ).toStrictEqual(['https://t.co/gJzevaFrrN']);
    });

    it('alone', async () => {
      expect(
        TwitterLinkUnshortener.extractShortlinks(`https://t.co/gJzevaFrrN`),
      ).toStrictEqual(['https://t.co/gJzevaFrrN']);
    });

    it('in a messy group', async () => {
      expect(
        TwitterLinkUnshortener.extractShortlinks(
          `https://t.co/gJzevaFrrN 🥁https://t.co/gJzevaFrrN https://t.co/gJzevaFrrN https://t.co/gJzevaFrrN🥁https://t.co/gJzevaFrrN🥁`,
        ),
      ).toStrictEqual([
        'https://t.co/gJzevaFrrN',
        'https://t.co/gJzevaFrrN',
        'https://t.co/gJzevaFrrN',
        'https://t.co/gJzevaFrrN',
        'https://t.co/gJzevaFrrN',
      ]);
    });
  });

  describe('unshortenLinks', () => {
    describe('removes media URLs', () => {
      for (const mediaType of ['video', 'photo']) {
        it(`of type '${mediaType}'`, async () => {
          jest
            .spyOn(TwitterLinkUnshortener, 'unshortenLink')
            .mockResolvedValueOnce(`https://twitter.com/test/${mediaType}/1`);
          expect(
            await TwitterLinkUnshortener.unshortenLinks(
              `test https://t.co/gJzevaFrrN🥁 test`,
            ),
          ).toStrictEqual('test 🥁 test');
        });
      }
    });

    it('expands non-media URLs', async () => {
      jest
        .spyOn(TwitterLinkUnshortener, 'unshortenLink')
        .mockResolvedValueOnce('https://www.levellr.com/1')
        .mockResolvedValueOnce('https://www.levellr.com/2');
      expect(
        await TwitterLinkUnshortener.unshortenLinks(
          `test https://t.co/gJzevaFrrN https://t.co/gJzevaFrr1`,
        ),
      ).toStrictEqual(
        'test https://www.levellr.com/1 https://www.levellr.com/2',
      );
    });
  });
});
