import { Component, ViewChild } from '@angular/core';
import { TableBuilder } from '../../../projects/table-builder/src/lib/classes/table-builder';
import { Subject, Observable, of, ReplaySubject } from 'rxjs';
import { map, scan, startWith } from 'rxjs/operators';
import { MetaData, SortDirection, FieldType, ArrayAdditional, ArrayStyle } from '../../../projects/table-builder/src/lib/interfaces/report-def';
import { combineArrays } from '../../../projects/table-builder/src/lib/functions/rxjs-operators';
import { Store } from '@ngrx/store';
import { TableContainerComponent } from '../../../projects/table-builder/src/lib/components';
import { FilterType } from '../../../projects/table-builder/src/lib/enums/filterTypes';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FilterInfo } from '../../../projects/table-builder/src/lib/classes/filter-info';
import { MatSelectChange } from '@angular/material/select';
import { LowerCasePipe } from '@angular/common';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  gas: boolean;
  date: Date;
  moreInfo?: string []
  phone: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', gas: true , date: new Date(2020, 9, 8), phone: null,moreInfo: ['hello','world' ]  },
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', gas: true, date: null, phone: undefined , moreInfo: ['can', 'you', 'see', 'me']},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', gas: false, date: new Date(2020, 9, 5), phone: '       ' },
  {position: undefined, name: 'Beryllium', weight: 9.0122, symbol: 'Be', gas: false, date: new Date(2020, 1, 4), phone: '2341185656', moreInfo: [] },
  {position: 5, name: '', weight: 9.811, symbol: 'B', gas: false, date: new Date(2020, 9, 3),  phone: '234' },
  {position: 6, name: undefined, weight: 12.0107, symbol: 'C', gas: false, date: new Date(2020, 9, 6), phone: '2346783425' , moreInfo: ['hi'] },
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', gas: true, date: new Date(2020, 9, 7), phone: '23909085656' },
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', gas: false, date: new Date(2020, 9, 1), phone: '8456782345' },
  {position: 9, name: 'Neon', weight: 20.1797, symbol: 'Ne', gas: true, date: undefined, phone: '2341234456' },
  {position: null, name: null, weight: 18.9984, symbol: 'F', gas: false, date: new Date(2020, 9, 9), phone: '123456789012' },
];

const additional: ArrayAdditional = {
  arrayStyle: ArrayStyle.NewLine,
};

const META_DATA: MetaData[] = [
  {key: 'position', fieldType: FieldType.Hidden, order: 3, additional : {footer:{type : 'sum' }} },
  {key: 'symbol', order:2, fieldType: FieldType.String },
  {key: 'date', fieldType: FieldType.Date , displayName: 'The Date',
    preSort: {direction: SortDirection.asc, precedence: 1},
    additional: {dateFormat: 'shortDate'},
    click: (element, key) => console.log(element,key)
  },
  {key: 'name', order: 1,fieldType: FieldType.String,
    additional: {
      export: { prepend: "'" },
      FilterOptions: { FilterableValues : ['Oxygen', 'Nitrogen','Neon']},
      styles: { color: 'yellow'  },
    },
    transform: (o: string) => o + ' #'
  },
  {key: 'gas', fieldType: FieldType.Boolean , additional: {
    styles: {  maxWidth:'10px'},
  } },
  {key: 'phone', fieldType: FieldType.PhoneNumber },
  {key: 'moreInfo', fieldType: FieldType.Array, additional},
  {key:'expression', fieldType: FieldType.Expression,
    transform: (o: PeriodicElement) => o.symbol + ' my symbol ' + o.name,
    additional: {
      styles: {color: 'green', flex: '0 0 200px'}
    },
    click: (element, key) => console.log(element,key)
  }
];



@Component({
  selector: 'app-table-builder-example',
  templateUrl: './table-builder-example.component.html',
  styleUrls: ['./table-builder-example.component.css']
})
export class TableBuilderExampleComponent {
  public tableBuilder: TableBuilder;
  newElement$ = new Subject<PeriodicElement>();
  metaData$ = new ReplaySubject<MetaData[]>();
  myFilter = new Subject<Array<(val: PeriodicElement) => boolean>>();

  @ViewChild(TableContainerComponent) tableContainer: TableContainerComponent;

  isFilterChecked: Observable<FilterInfo>;
  runWhen = ()=>true;

  constructor(private store: Store<any>, lcp:  LowerCasePipe) {
    const addedElements = this.newElement$.pipe(
      scan((acc, value) => { acc.push(value); return acc; }, []),
      startWith([]),
    );
    META_DATA[1].transform = lcp;
    const all = combineArrays([of(ELEMENT_DATA), addedElements]);
    this.metaData$.next(META_DATA);
    this.tableBuilder = new TableBuilder(all, this.metaData$);
    // this.tableBuilder = new TableBuilder(all, of([{key:'date',fieldType: FieldType.Date , displayName: 'The Date'}]),{metaDataPlusRestOfFields:true});
  }


  emitter(d)
  {
    console.log(d);
  }


  ngAfterViewInit() {
    setTimeout(() => {
      this.isFilterChecked = this.tableContainer.state.getFilter$('test')
      this.isFilterChecked.subscribe();
    }, 0);
  }

  addItem() {
    this.newElement$.next({
      position: 11, name: 'Gold', weight: 196.96657 , symbol: 'Au', gas: false, date: new Date(), phone:'5675675678'
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

  multipleValuesTest(change: MatSelectChange) {
    const fi = {
      filterId: 'multipleValuesTest',
      filterType: FilterType.StringIn,
      filterValue: change.value.map(v => ({value:v})),
      key: 'name',
      fieldType: FieldType.String
    }

    this.tableContainer.state.addFilter(fi);
  }

  selectionEvent(a){
    console.log(a)
  }
}
