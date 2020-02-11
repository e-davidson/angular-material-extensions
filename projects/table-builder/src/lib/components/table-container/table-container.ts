import {
  Component,
  Input,
  EventEmitter,
  Output,
  ContentChildren,
  QueryList,
  ChangeDetectionStrategy,
  ViewChildren,
  ChangeDetectorRef
} from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { map, shareReplay } from 'rxjs/operators';
import { createFilterFunc } from '../../classes/filter-info';
import { DataFilter } from '../../classes/data-filter';
import { combineArrays } from '../../functions/rxjs-operators';
import { TableBuilder } from '../../classes/table-builder';
import { MatColumnDef, MatRowDef } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { ColumnBuilderComponent } from '../column-builder/column-builder.component';
import { CustomCellDirective } from '../../directives';
import { TableStateManager } from '../../classes/table-state-manager';
import * as _ from 'lodash';


@Component({
  selector: 'tb-table-container',
  templateUrl: './table-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TableStateManager]
}) export class TableContainerComponent {
  _tableId: string;
  @Input() set tableId(value: string) {
    this._tableId = value;
    if (this._pageSize) {
      this.state.updateState( { pageSize: this._pageSize});
    }
  }
  @Input() SaveState: boolean = false;
  @Input() tableBuilder: TableBuilder;
  @Input() IndexColumn = false;
  @Input() SelectionColumn = false;
  @Input() trackBy: string;
  @Input() isSticky = true;
  _pageSize: number;
  @Input() set pageSize(size: number) {
    this._pageSize = size;
    if ( this._tableId ) {
      this.state.updateState( { pageSize: size});
    }
  }
  @Input() inputFilters: Observable<Array<(val: any) => boolean>>;
  @Output() selection$ = new EventEmitter();
  subscriptions: Subscription[] = [];
  @Output() data = new Subject<any[]>();

  @ContentChildren(MatRowDef) customRows: QueryList<MatRowDef<any>>;
  @ContentChildren(CustomCellDirective) customCells: QueryList<CustomCellDirective>;

  @ViewChildren(ColumnBuilderComponent) columnBuilders: QueryList<ColumnBuilderComponent>;
  hiddenFields: string [] = [];
  columns: MatColumnDef[];
  filtersExpanded = false;
  rules$: Observable<Sort[]>;
  FieldType = FieldType;
  filteredData: DataFilter;
  filterCols$: Observable<MetaData[]>;

  myColumns$: Observable<{metaData: MetaData, customCell: CustomCellDirective}[]>;

  constructor(
      private cdr: ChangeDetectorRef,
      public state: TableStateManager
    ) { }



  ngOnInit() {
    if (this._tableId ) {
      this.state.tableId = this._tableId;
    }
    this.InitializeData();
  }

  ngAfterContentInit() {
    this.InitializeColumns();
  }

  InitializeData() {
    const filters = [
      this.state.filters$.pipe(map( fltrs => fltrs.map(filter => createFilterFunc(filter) )))
    ];

    if (this.inputFilters) {
      filters.push(this.inputFilters);
    }

    this.filteredData = new DataFilter(
      combineArrays( filters ),
      this.tableBuilder.getData$()
    );

    this.subscriptions.push( this.filteredData.filteredData$.subscribe(this.data));

    this.filterCols$ = this.tableBuilder.metaData$.pipe(
      map(md => md.filter(m => m.fieldType !== FieldType.Hidden))
    );
  }

  InitializeColumns() {

    this.myColumns$ = this.tableBuilder.metaData$.pipe(
      map( metaDatas => {
        return [
          ...metaDatas.filter( md => !this.customCells.find(cc => cc.customCell === md.key) ),
          ...this.customCells.filter( cc => !metaDatas.find( md => md.key ===  cc.customCell )  ).map( cc => cc.getMetaData() ),
          ...metaDatas.filter( md => this.customCells.find(cc => cc.customCell === md.key) )
            .map( md => ({...md, ...this.customCells.find(cc => cc.customCell === md.key)})
          ),
        ];
      }),
      map( metaDatas =>
        metaDatas.map( metaData => ({metaData, customCell: this.customCells.find( cc => cc.customCell === metaData.key ) }))  ),
    );

    this.subscriptions.push(this.myColumns$.pipe(map(columns => _.orderBy( columns.map( column => column.metaData ), 'order' )   ))
    .subscribe( columns => {
      this.state.setMetaData(columns);
    }));

    this.preSort();

  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.columns = _.flatten(this.columnBuilders.map( cb => cb.columnDefs.toArray() ));
      this.cdr.markForCheck();
    }, 0);
  }

  preSort() {
    this.rules$ = this.state.state$.pipe(map(state => state.metaData)).pipe(
      map(templates =>
              templates
                .filter(( metaData ) => metaData.preSort)
                .sort(
                  ({  preSort: ps1  }, { preSort: ps2 } ) =>  (ps1.precedence || Number.MAX_VALUE) - ( ps2.precedence || Number.MAX_VALUE)
                )
                .map(( {key, preSort} ) =>
                  ({ active: key, direction: preSort.direction }))
      ),
      shareReplay());
  }
  resort$ = new Subject<boolean>();
  resort(){
    this.resort$.next(true);
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (!this.SaveState || !this._tableId) {
      this.state.destroy();
    }
  }
}
