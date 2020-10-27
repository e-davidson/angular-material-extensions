import { MultiSortDirective } from './multi-sort.directive';
import { Sort, MatSortable } from '@angular/material/sort';
import { BehaviorSubject } from 'rxjs';
import { FieldType } from '../interfaces/report-def';
import { TableBuilderConfigToken } from '../classes/TableBuilderConfig';
import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TableStateManager } from '../classes/table-store';
import { StoreModule } from '@ngrx/store';
import { tableStateReducer } from '../ngrx/reducer';

describe('MultiSortDirective', () => {

    let directive: MultiSortDirective;
    let rules: Sort[];

    const data = [
      {
        name: 'Joe',
        age: 10,
        balance: 25
      },
      {
        name: 'Jane',
        age: 20,
        balance: 35
      }
    ];
    const metaData =  [
      {
        key: 'name',
        fieldType: FieldType.String,
        additional: {},
        order : 1
      },
      {
        key: 'age',
        fieldType: FieldType.Number,
        additional: {},
        order : 2
      },
      {
        key: 'balance',
        fieldType: FieldType.Number,
        additional: {},
        order : 3
      }
    ];

    const initialState = {fullTableState: {
      'test-id': {
        metaData,
        hiddenKeys: [],
        pageSize: 10,
        initialized : true ,
        filters: [],
        sorted : [],
      }
    }};

    beforeEach(() => {

      TestBed.configureTestingModule({
        declarations: [],
        providers: [
         { provide : TableBuilderConfigToken , useValue: {defaultTableState: { }}},
         DatePipe,
         TableStateManager,
        ],
        imports: [
          StoreModule.forRoot({'fullTableState': tableStateReducer}),
        ]
      })
      .compileComponents();

      const stateManager = TestBed.inject(TableStateManager);
      stateManager.tableId = 'test-id';
      stateManager.initializeState();
      directive = new MultiSortDirective(stateManager);

        rules = [
            { active: 'a', direction: 'asc' },
            { active: 'b', direction: 'asc' },
            { active: 'c', direction: 'asc' },
        ];

        [...rules].reverse().forEach( rule => stateManager.setSort(rule.active, rule.direction ));
        directive.ngOnInit();
    });

    describe('Initializing Rules',  () => {

        it('should inititialize the rules', () => {
            expect(directive.rules).toEqual(rules);
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
            directive.sort({...sort});
            expect(directive.rules.length).toBe(originalLength - 1, 'updated rules length should be one smaller than original');
        });
    });
});
