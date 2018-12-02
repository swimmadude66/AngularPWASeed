import { trigger, transition, style, animate, state } from '@angular/animations';

export const slideInTop = trigger('slideInTop', [
    transition(':enter', [
      style({transform: 'translate3d(0, -100%, 0)'}),
      animate(300)
    ]),
    transition(':leave', [
      animate(300, style({transform: 'translate3d(0, -100%, 0)'}))
    ])
]);

export const toast = trigger('toast', [
    transition(':enter', [
        style({bottom: '-50rem', opacity:0}),
        animate(250)
    ]),
    transition(':leave', [
        animate(250, style({left: '-50rem'}))
    ])
]);

export const expand = trigger('expand', [
    transition(':enter', [
        style({height: 0}),
        animate(250)
    ]),
    transition(':leave', [
        animate(250, style({height: 0}))
    ])
]);


export const rightSlide = trigger('rightSlide', [
    state('1', style({right: '0'})),
    state('0', style({right: '-50rem'})),
    transition('0 => 1', animate(250)),
    transition('1 => 0', animate(250)),
    transition(':enter', [
        style({right: '-50rem'}),
        animate(250)
    ]),
    transition(':leave', [
        animate(250, style({right: '0'}))
    ])
]);
