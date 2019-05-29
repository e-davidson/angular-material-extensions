import { MultiSortDirective } from './multi-sort.directive';
import { Sort, MatSortable } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';

describe('MultiSortDirective', () => {

    let directive: MultiSortDirective;
    let rules: Sort[];
    let rules$: BehaviorSubject<Sort[]>;

    beforeEach(() => {
        directive = new MultiSortDirective();

        rules = [
            { active: 'a', direction: 'asc' },
            { active: 'b', direction: 'asc' },
            { active: 'c', direction: 'asc' },
        ];

        rules$ = new BehaviorSubject(rules);
        directive.rules$ = rules$;
        directive.ngOnInit();
    });

    describe('Initializing Rules', () => {

        it('should inititialize the rules', () => {
            expect(directive.rules).toEqual(rules);

            directive.multiSortChange.subscribe( rls => expect(directive.rules).toEqual(rls));
        });
    });

    describe('Updating the rules', () => {
        it('should add new rule to begining of rules array', () => {
            const originalLength = directive.rules.length;
            const sort: MatSortable = { id: 'd', start: 'asc', disableClear: false };
            directive.sort(sort);

            expect(directive.rules.length).toBe(originalLength + 1, 'updated rules length should be one larger than original');
            expect(directive.rules[0].active).toBe(sort.id);
        });

        it('should remove old rule for the column of new rule and replace it with new rule', () => {
            const originalLength = directive.rules.length;
            const sort: MatSortable = { id: 'a', start: 'asc', disableClear: false };
            directive.sort(sort);

            expect(directive.rules.length).toBe(originalLength, 'updated rules length should be same as original');
            expect(directive.rules[0].direction).toBe('desc');
        });

        it('should remove old rule without replacing it if new rule for that column has no direction', () => {
            const originalLength = directive.rules.length;
            const sort: MatSortable = { id: 'a', start: 'asc', disableClear: false };
            directive.sort({...sort});
            console.log(directive.rules);

            directive.sort({...sort});
            console.log(directive.rules);
            expect(directive.rules.length).toBe(originalLength - 1, 'updated rules length should be one smaller than original');
        });
    });



});
