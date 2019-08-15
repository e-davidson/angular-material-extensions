import { Component, OnInit } from '@angular/core';
import { TableBuilder } from '../../../projects/table-builder/src/lib/classes/table-builder';
import { scheduled, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { asap } from 'rxjs/internal/scheduler/asap';
import { scan, startWith, map } from 'rxjs/operators';
import { MetaData, SortDirection, FieldType } from '../../../projects/table-builder/src/lib/interfaces/report-def';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

const META_DATA: MetaData[] = [
  {key: 'position', fieldType: FieldType.Number },
  {key: 'symbol', fieldType: FieldType.String, preSort: {direction: SortDirection.asc, precedence: 1 }},
  {key: 'name', fieldType: FieldType.String }
];



@Component({
  selector: 'app-table-builder-example',
  templateUrl: './table-builder-example.component.html',
  styleUrls: ['./table-builder-example.component.css']
})
export class TableBuilderExampleComponent implements OnInit {
  public tableBuiler: TableBuilder;
  newElement$ = new Subject<PeriodicElement>();
  metaData$ = new BehaviorSubject(META_DATA);
  myFilter = new Subject<Array<(val: PeriodicElement) => boolean>>();
  constructor() {
    const addedElements = this.newElement$.pipe(
      scan((acc, value ) => {acc.push(value); return acc; }, []),
      startWith([]),
    );
    const all = combineLatest([scheduled([ELEMENT_DATA], asap ), addedElements]).pipe(
      map( ([a, b]) => [...a, ...b])
    );
    this.tableBuiler = new TableBuilder( all, this.metaData$ );
  }

  ngOnInit() {
  }

  addItem() {
    this.newElement$.next({
      position: 11, name: 'Gold', weight: 196.96657 , symbol: 'Au'
    });

    this.metaData$.next(META_DATA);
  }

  emitData(data) {
    console.log(data);
  }

  emitFilter() {
    this.myFilter.next(
      [
        element => element.name.includes('B')
      ]
    );
  }

  clearFilter() {
    this.myFilter.next([]);
  }

}
