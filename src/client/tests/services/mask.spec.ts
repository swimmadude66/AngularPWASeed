import {expect} from 'chai';
import { MaskService } from '@services/index';

describe('MaskService', () => {
    let maskService: MaskService;

    describe('maskPhone', () => {

        beforeEach(()=> {
            maskService = new MaskService();
        });

        it('should format a full phone number', () => {
            const original = '1111111111';
            const masked = maskService.maskPhone(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('(111) 111 1111');
        });

        it('should ignore characters after the first nine', () => {
            const original = '111111111111111111111111';
            const masked = maskService.maskPhone(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('(111) 111 1111');
        });

        it('should format as you type', ()=> {
            let original = '1';
            let masked = maskService.maskPhone(original);
            expect(masked).to.equal('(1');

            original = '11';
            masked = maskService.maskPhone(original);
            expect(masked).to.equal('(11');

            original = '111';
            masked = maskService.maskPhone(original);
            expect(masked).to.equal('(111)');

            original = '1111';
            masked = maskService.maskPhone(original);
            expect(masked).to.equal('(111) 1');

            original = '11111';
            masked = maskService.maskPhone(original);
            expect(masked).to.equal('(111) 11');

            original = '111111';
            masked = maskService.maskPhone(original);
            expect(masked).to.equal('(111) 111');

            original = '1111111';
            masked = maskService.maskPhone(original);
            expect(masked).to.equal('(111) 111 1');

            original = '11111111';
            masked = maskService.maskPhone(original);
            expect(masked).to.equal('(111) 111 11');

            original = '111111111';
            masked = maskService.maskPhone(original);
            expect(masked).to.equal('(111) 111 111');

            original = '1111111111';
            masked = maskService.maskPhone(original);
            expect(masked).to.equal('(111) 111 1111');

            original = '1111111111111111111111111111111111';
            masked = maskService.maskPhone(original);
            expect(masked).to.equal('(111) 111 1111');
            
        });
    });

    describe('maskDate', () => {

        beforeEach(()=> {
            maskService = new MaskService();
        });

        it('should format a full date', () => {
            const original = '12212012';
            const masked = maskService.maskDate(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('12/21/2012');
        });

        it('should fill in missing numbers', () => {
            const original = '1/1/1970';
            const masked = maskService.maskDate(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('01/01/1970');
        });

        it('should fill in missing month prefix', () => {
            const original = '1/11/1970';
            const masked = maskService.maskDate(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('01/11/1970');
        });

        it('should fill in missing day prefix', () => {
            const original = '11/1/1970';
            const masked = maskService.maskDate(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('11/01/1970');
        });

        it('should handle different formats', () => {
            const original = '1-1.1970';
            const masked = maskService.maskDate(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('01/01/1970');
        });

        it('should ignore characters after the first 8', () => {
            const original = '11111111111111111111';
            const masked = maskService.maskDate(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('11/11/1111');
        });

        it('should format as you type', ()=> {
            let original = '1';
            let masked = maskService.maskDate(original);
            expect(masked).to.equal('1');

            original='1/';
            masked = maskService.maskDate(original);
            expect(masked).to.equal('01/');

            original='1/1';
            masked = maskService.maskDate(original);
            expect(masked).to.equal('01/1');

            original = '11';
            masked = maskService.maskDate(original);
            expect(masked).to.equal('11/');

            original = '111';
            masked = maskService.maskDate(original);
            expect(masked).to.equal('11/1');

            original = '11/1/';
            masked = maskService.maskDate(original);
            expect(masked).to.equal('11/01/');

            original = '1111';
            masked = maskService.maskDate(original);
            expect(masked).to.equal('11/11/');

            original = '11111';
            masked = maskService.maskDate(original);
            expect(masked).to.equal('11/11/1');

            original = '111111';
            masked = maskService.maskDate(original);
            expect(masked).to.equal('11/11/11');

            original = '1111111';
            masked = maskService.maskDate(original);
            expect(masked).to.equal('11/11/111');

            original = '11111111';
            masked = maskService.maskDate(original);
            expect(masked).to.equal('11/11/1111');

            original = '1111111111111111111111111111111111111';
            masked = maskService.maskDate(original);
            expect(masked).to.equal('11/11/1111');            
        });
    });

    describe('maskCurrency', () => {

        beforeEach(()=> {
            maskService = new MaskService();
        });

        it('should format complicated number', () => {
            const original = '1234567.89';
            const masked = maskService.maskCurrency(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('$1,234,567.89');
        });

        it('should format amount with no cents', () => {
            const original = '1234567';
            const masked = maskService.maskCurrency(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('$1,234,567');
        });

        it('should format amount with no dollars', () => {
            const original = '.15';
            const masked = maskService.maskCurrency(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('$0.15');
        });

        it('should format amount with imprecise cents', () => {
            const original = '.33333333333';
            const masked = maskService.maskCurrency(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('$0.33');
        });

        it('should format amount with imprecise cents and dollars', () => {
            const original = '33.33333333333';
            const masked = maskService.maskCurrency(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('$33.33');
        });

        it('should format amount with incomplete cents', () => {
            const original = '.3';
            const masked = maskService.maskCurrency(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('$0.3');
        });

        it('should ignore leading zeros, except the last one', () => {
            const original = '000000000000000.25';
            const masked = maskService.maskCurrency(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('$0.25');
        });

        it('should leave non-leading zeros alone', () => {
            const original = '1000000000000000.25';
            const masked = maskService.maskCurrency(original);
            expect(masked).to.exist;
            expect(masked).to.be.a('string');
            expect(masked).to.equal('$1,000,000,000,000,000.25');
        });
    });
});
