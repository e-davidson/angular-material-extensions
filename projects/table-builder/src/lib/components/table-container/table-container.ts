import {
  Component,
  Input,
  EventEmitter,
  Output,
  ContentChildren,
  QueryList,
  ChangeDetectionStrategy,
  ViewChildren,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import { Observable, Subject, concat, Subscription } from 'rxjs';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { first, map, tap, filter } from 'rxjs/operators';
import { FilterInfo } from '../../classes/filter-info';
import { DataFilter } from '../../classes/data-filter';
import { mapArray, combineArrays } from '../../functions/rxjs-operators';
import { TableBuilder } from '../../classes/table-builder';
import { MatColumnDef, MatRowDef } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { ColumnBuilderComponent } from '../column-builder/column-builder.component';
import { CustomCellDirective } from '../../directives';
import { TableBuilderConfigToken, TableBuilderConfig } from '../../classes/TableBuilderConfig';
import * as _ from 'lodash';


@Component({
  selector: 'tb-table-container',
  templateUrl: './table-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
}) export class TableContainerComponent {

  @Input() tableBuilder: TableBuilder;
  @Input() IndexColumn = false;
  @Input() SelectionColumn = false;
  @Input() trackBy: string;
  @Input() isSticky = true;
  @Input() pageSize = 20;
  @Input() inputFilters: Observable<Array<(val: any) => boolean>>;
  @Output() filters$ = new EventEmitter();
  @Output() selection$ = new EventEmitter();
  dataSubscription: Subscription;
  @Output() data = new Subject<any[]>();

  @ContentChildren(MatRowDef) customRows: QueryList<MatRowDef<any>>;
  @ContentChildren(CustomCellDirective) customCells: QueryList<CustomCellDirective>;

  @ViewChildren(ColumnBuilderComponent) columnBuilders: QueryList<ColumnBuilderComponent>;

  columns: MatColumnDef[];
  filtersExpanded = false;
  rules$: Observable<Sort[]>;
  FieldType = FieldType;
  displayedColumns$: Observable<string[]>;
  columnsSelected$ = new Subject<string[]>();
  columnNames$: Observable<MetaData[]>;
  filteredData: DataFilter;
  filterCols$: Observable<MetaData[]>;
  inlineFilters$ = new Subject<FilterInfo[]>();

  myColumns$: Observable<{metaData: MetaData, customCell: CustomCellDirective}[]>;

  constructor(private cdr: ChangeDetectorRef, @Inject(TableBuilderConfigToken) config: TableBuilderConfig ) {
    this.pageSize = config.pageSize;
  }

  ngOnInit() {
    this.InitializeData();
  }

  ngAfterContentInit() {
    this.InitializeColumns();
  }

  InitializeData() {
    const filters = [
      this.filters$.pipe(
        tap( d => console.log(d)),
        mapArray((fltr: FilterInfo) => fltr.getFunc())
      )
    ];

    if (this.inputFilters) {
      filters.push(this.inputFilters);
    }

    filters.push(
      this.inlineFilters$.pipe(map(f => this.columnBuilders.filter( cb => cb.filter.filterValue  ).map( cb => cb.filter.getFunc() )  ))
    );

    this.filteredData = new DataFilter(
      combineArrays( filters ),
      this.tableBuilder.getData$()
    );

    this.dataSubscription = this.filteredData.filteredData$.subscribe(this.data);

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
      map( metaDatas => metaDatas.map(metaData => ({metaData, customCell: this.customCells.find( cc => cc.customCell === metaData.key ) })))
    );

    this.columnNames$ = this.myColumns$.pipe(map(columns => columns.map( column => column.metaData )));
    this.preSort();
    this.displayedColumns$ = concat(
      this.columnNames$.pipe(first(), map(cols => cols.map(c => c.key))),
      this.columnsSelected$
    );
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.columns = _.flatten(this.columnBuilders.map( cb => cb.columnDefs.toArray() ));
      this.cdr.markForCheck();
    }, 0);
  }

  preSort() {
    this.rules$ = this.columnNames$.pipe(
      map(templates =>
      templates.filter(( metaData ) => metaData.preSort)
        .sort(
          ({  preSort: ps1  }, { preSort: ps2 } ) =>  (ps1.precedence || Number.MAX_VALUE) - ( ps2.precedence || Number.MAX_VALUE)
        )
        .map(( {key, preSort} ) =>
          ({ active: key, direction: preSort.direction }))
    ));
  }

  ngOnDestroy() {
    this.dataSubscription.unsubscribe();
  }

}
