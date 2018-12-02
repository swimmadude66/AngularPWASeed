import {expect} from 'chai';
import {FloorNumberPipe} from '@pipes/index';

describe('FloorNumberPipe', () => {

    let pipe: FloorNumberPipe;

    before(() => {
        pipe = new FloorNumberPipe();
    });

    describe('transform', () => {

        it('should floor numbers', () => {
            const originalNumbers: number[] = [7.6, 8, 0.2, 99, 1.2358, 9.9999];
            originalNumbers.forEach(originalNumber => {
                const floored = pipe.transform(originalNumber);
                expect(floored).to.exist;
                expect(floored).to.be.a('number');
                expect(floored).to.equal(Math.floor(originalNumber));
            });
        });

        it('should parse numbers from strings', () => {
            const originalNumbers: number[] = [7.6, 8, 0.2, 99, 1.2358, 9.9999];
            originalNumbers.forEach(originalNumber => {
                const floored = pipe.transform(''+originalNumber);
                expect(floored).to.exist;
                expect(floored).to.be.a('number');
                expect(floored).to.equal(Math.floor(originalNumber));
            });
        });

        it('should ignore invalid inputs', () => {
            const floored = pipe.transform('Not a number...');
            expect(floored).to.exist;
            expect(floored).to.be.a('string');
            expect(floored).to.equal('Not a number...');
        });
    });
});
