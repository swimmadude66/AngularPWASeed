import {expect} from 'chai';
import {ShortenTextPipe} from '@pipes/index';

describe('ShortenPipe', () => {

    let pipe: ShortenTextPipe;

    before(() => {
        pipe = new ShortenTextPipe();
    });

    describe('transform', () => {

        it('should leave short text alone', () => {
            const originalText = 'I am very short.';
            const shortenedText = pipe.transform(originalText);
            expect(shortenedText).to.exist;
            expect(shortenedText).to.be.a('string', 'Output was not a string');
            expect(shortenedText.length).to.equal(originalText.length);
        });

        it('should avoid replacing chars if ... is longer', () => {
            const originalText = 'I am not as short, but still short.';
            const shortenedText = pipe.transform(originalText, originalText.length-2);
            expect(shortenedText).to.exist;
            expect(shortenedText).to.be.a('string', 'Output was not a string');
            expect(shortenedText.length).to.equal(originalText.length);
        });

        it('should shorten text longer than softLimit + 3', () => {
            const originalText = 'I am a very long string, which cannot be displayed in full';
            const shortenedText = pipe.transform(originalText, originalText.length-10);
            expect(shortenedText).to.exist;
            expect(shortenedText).to.be.a('string', 'Output was not a string');
            expect(shortenedText.length).to.equal(originalText.length-7); // limit + "..."
            expect(shortenedText.slice(shortenedText.length-3)).to.equal('...');
        });
    });
});
