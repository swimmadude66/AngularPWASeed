import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MaskService {

    constructor(
    ){
    }

    maskPhone(unmasked: string): string {
        let mask = unmasked.replace(/[^0-9]/g, '');
        // adding chars
        const open = /^([0-9])/;
        mask = mask.replace(open, '($1');
        if (mask.length > 3) {
            const prefix = /^\(?([0-9]{3})\)?/;
            mask = mask.replace(prefix, '($1)');
        }
        if (mask.length > 5) {
            const mid = /^\(([0-9]{3})\)[\. \-]?([0-9])/;
            mask = mask.replace(mid, '($1) $2');
        }
        if (mask.length > 9) {
            const end = /^\(?([0-9]{3})\)?[\. \-]?([0-9]{3})[\. \-]?([0-9]{1,4}).*$/;
            mask = mask.replace(end, '($1) $2 $3');
        }
        return mask;
    }

    maskDate(unmasked: string): string {
        let mask = unmasked.replace(/[^0-9\.\-\s\/\\]/g, '').replace(/^[^0-9]*/, ''); // remove unwelcome chars, and leading seps
        const maskparts = mask.split(/[\.\-\s\/\\]/g);
        mask = maskparts.map((p, i) => {
            if (i < (maskparts.length-1) && p.length === 1) {
                return `0${p}`;
            } else {
                return p;
            }
        }).join('');
        if (mask.length >= 2) {
            const month = /^([0-9]{2})[\.\-\s\/\\]?/;
            mask = mask.replace(month, '$1/');
        }
        if (mask.length >= 5) {
            const day = /^([0-9]{2})[\.\-\s\/\\]?([0-9]{2})[\.\-\s\/\\]?/;
            mask = mask.replace(day, '$1/$2/');
        }
        if (mask.length >= 10) {
            const year = /^([0-9]{2})[\.\-\s\/\\]?([0-9]{2})[\.\-\s\/\\]?([0-9]{4}).*$/;
            mask = mask.replace(year, '$1/$2/$3');
        }
        return mask;
    }

    maskCurrency(unmasked: string): string {
        const raw = unmasked
        .replace(/[^0-9\.]/g, '')
        .replace(/^[^0-9\.]*([0-9]*\.?[0-9]*)[^0-9]*$/, '$1')
        .replace(/^([0-9]*\.[0-9]{2}).*$/, '$1');

        const hasCents = raw.indexOf('.') >= 0;
        const moneyParts = raw.split('.');
        const dollars = ((moneyParts[0].length > 0) ? moneyParts[0] : '0').replace(/^0*([0-9]+)/, '$1');
        const cents = (hasCents ? `.${moneyParts[1] || ''}` : '');
        let commaDollars = [];
        let grouper = 0;
        for(let i=dollars.length-1; i>=0; i--) {
            commaDollars.unshift(dollars[i]);
            grouper++;
            if (grouper === 3 && i > 0) {
                commaDollars.unshift(',');
                grouper = 0;
            }
        }

        const mask = commaDollars.join('') + cents;

        return `$${mask}`;
    }
}
