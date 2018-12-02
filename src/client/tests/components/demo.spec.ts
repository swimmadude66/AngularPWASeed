import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFactory, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { expect } from 'chai';
import { spy } from 'ts-mockito/lib/ts-mockito';
import {DemoComponent} from '@components/demo/component';

describe('DemoComponent', () => {

    let fixture: ComponentFixture<DemoComponent>;
    let comp: DemoComponent;
    let de: DebugElement;
    let spiedComp: DemoComponent;

    beforeEach(done => {
        (async () => {
            TestBed.configureTestingModule({
                imports: [RouterTestingModule, HttpClientTestingModule],
                declarations: [DemoComponent],
                schemas: [NO_ERRORS_SCHEMA],
            });
            await TestBed.compileComponents();
        })().then(done).catch(e => done(e));
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DemoComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        spiedComp = spy(comp);
    });

    describe('init', () => {
        it('should be inited', () => {
            expect(ComponentFactory).to.not.be.undefined;
        });
    });
});
