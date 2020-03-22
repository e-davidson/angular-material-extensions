import { Component, OnInit, ViewChild } from '@angular/core';
import { TableBuilder } from '../../../projects/table-builder/src/lib/classes/table-builder';
import { scheduled, Subject, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { asap } from 'rxjs/internal/scheduler/asap';
import { scan, startWith, map, tap, filter } from 'rxjs/operators';
import { MetaData, SortDirection, FieldType } from '../../../projects/table-builder/src/lib/interfaces/report-def';
import { combineArrays } from '../../../projects/table-builder/src/lib/functions/rxjs-operators';
import { Store } from '@ngrx/store';
import { TableContainerComponent } from '../../../projects/table-builder/src/lib/components';
import { FilterType } from '../../../projects/table-builder/src/lib/enums/filterTypes';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FilterInfo } from '../../../projects/table-builder/src/lib/classes/filter-info';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  gas: boolean;
  date: Date;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', gas: true , date: new Date(2019, 1, 8) },
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', gas: true, date: null },
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', gas: false, date: new Date(2019, 1, 5) },
  {position: undefined, name: 'Beryllium', weight: 9.0122, symbol: 'Be', gas: false, date: new Date(2019, 1, 4) },
  {position: 5, name: '', weight: 10.811, symbol: 'B', gas: false, date: new Date(2019, 1, 3) },
  {position: 6, name: undefined, weight: 12.0107, symbol: 'C', gas: false, date: new Date(2019, 1, 6) },
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', gas: true, date: new Date(2019, 1, 7) },
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', gas: false, date: new Date(2019, 1, 1) },
  {position: null, name: null, weight: 18.9984, symbol: 'F', gas: false, date: new Date(2019, 1, 9) },
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne', gas: true, date: undefined },
];

const META_DATA: MetaData[] = [
  {key: 'position', fieldType: FieldType.Currency, order: 2, additional : {footer:{type : 'sum' }} },
  {key: 'symbol', fieldType: FieldType.String },
  {key: 'name', fieldType: FieldType.String , width: '25%'},
  {key: 'gas', fieldType: FieldType.Boolean },
  {key: 'date', fieldType: FieldType.Date , displayName: 'The Date', preSort: {direction: SortDirection.asc, precedence: 1 } },
];



@Component({
  selector: 'app-table-builder-example',
  templateUrl: './table-builder-example.component.html',
  styleUrls: ['./table-builder-example.component.css']
})
export class TableBuilderExampleComponent {
  public tableBuilder: TableBuilder;
  newElement$ = new Subject<PeriodicElement>();
  metaData$ = new Subject<MetaData[]>();
  myFilter = new Subject<Array<(val: PeriodicElement) => boolean>>();

  @ViewChild(TableContainerComponent) tableContainer: TableContainerComponent;

  isFilterChecked: Observable<FilterInfo>;

  constructor(private store: Store<any>) {
    const addedElements = this.newElement$.pipe(
      scan((acc, value) => { acc.push(value); return acc; }, []),
      startWith([]),
    );
    const all = combineArrays([scheduled([ELEMENT_DATA], asap), addedElements]);
    setTimeout(() => {
      this.metaData$.next(META_DATA);
    }, 1000);
    this.tableBuilder = new TableBuilder(all, this.metaData$);
  }



  ngAfterViewInit() {
    setTimeout(() => {
      this.isFilterChecked = this.tableContainer.state.getFilter$('test')
      this.isFilterChecked.subscribe();
    }, 0);
  }

  addItem() {
    this.newElement$.next({
      position: 11, name: 'Gold', weight: 196.96657, symbol: 'Au', gas: false, date: new Date()
    });

    this.metaData$.next(META_DATA);
  }

  emitFilter() {
    this.myFilter.next(
      [
        element => element.name?.includes('B')
      ]
    );
  }

  clearFilter() {
    this.myFilter.next([]);
  }

  Checked(input: MatCheckboxChange) {
    if (input.checked) {
      const fi = {
        filterId: 'test',
        filterType: FilterType.NumberEquals,
        filterValue: 5,
        key: 'position',
        fieldType: FieldType.Number
      };
      this.tableContainer.state.addFilter(fi);
    } else {
      this.tableContainer.state.removeFilter('test');
    }
  }
}
