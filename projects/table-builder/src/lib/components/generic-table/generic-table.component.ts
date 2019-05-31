import {
  Component,
  ViewChild,
  Input,
  ChangeDetectionStrategy,
  AfterContentInit,
  Output,
  SimpleChanges,
  OnInit,
  QueryList,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { MatRowDef, MatTable } from '@angular/material/table';
import { Observable, combineLatest, scheduled, } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { MatTableObservableDataSource } from '../../classes/MatTableObservableDataSource';
import { SelectionModel } from '@angular/cdk/collections';
import { ColumnTemplates } from '../../interfaces/column-template';
import { MultiSortDirective } from '../../directives/multi-sort.directive';
import { asap } from 'rxjs/internal/scheduler/asap';
import { orderBy } from 'lodash';

@Component({
  selector: 'tb-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent implements AfterContentInit, OnInit {

  @Input() data$: Observable<any[]>;
  @Input() IndexColumn = false;
  @Input() SelectionColumn = false;
  @Input() trackBy: string;
  @Input() columns$: Observable<string[]>;
  @Input() rows: QueryList<MatRowDef<any>>;
  @Input() columnTemplates$: Observable<ColumnTemplates[]>;

  @Output() selection$: Observable<any>;

  @ViewChild(MultiSortDirective, { static: true }) _sort: MultiSortDirective;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  currentColumns: string[];
  selection: SelectionModel<any>;
  dataSource: MatTableObservableDataSource<any>;
  keys$: Observable<string[]>;
  rules$: Observable<Sort[]>;

  constructor() {
    this.selection = new SelectionModel<any>(true, []);
    this.selection$ = this.selection.changed;
  }

  trackByFunction = (index, item) => {
    if (!item) {
      return null;
    }
    if (this.trackBy) {
      return item[this.trackBy];
    }
    return item;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.rows && this.rows) {
      this.rows.forEach(r => {
        r.columns = this.currentColumns;
        if (this.table) {
          this.table.addRowDef(r);
        }
      });
    }
  }

  ngOnInit() {
    this.preSort();
  }

  ngAfterContentInit() {
    this.createDataSource();
    this.initColumns();
  }

  createDataSource() {
    this.dataSource = new MatTableObservableDataSource(
      this.data$.pipe(tap((d) => { this.selection.clear();
      }))
    );
    this.dataSource.sort = this._sort;
    this.dataSource.sortData = (data: {}[], sort: MultiSortDirective) =>
      orderBy(data, sort.rules.map(r => r.active), sort.rules.map(r => r.direction as direc));
    this.dataSource.paginator = this.paginator;
  }

  initColumns() {
    const staticColumns = [];
    if (this.SelectionColumn) {
      staticColumns.push('select');
    }
    if (this.IndexColumn) {
      staticColumns.push('index');
    }

    this.keys$ = combineLatest(
      [
        scheduled([staticColumns], asap),
        this.columns$,
      ]
    ).pipe(
      map(([def, customCells]) =>
        [
          ...def,
          ...customCells
        ]
      ),
      tap(d => {
        this.currentColumns = d;
        if (this.rows) {
          this.rows.forEach(
            r => r.columns = d
          );
        }
      })
    );
  }

  preSort() {
    this.rules$ = this.columnTemplates$.pipe(map(templates => {
      return templates.filter(({ metaData }) => metaData.preSort)
        .sort(
          ({ metaData: { preSort: ps1 } }, { metaData: { preSort: ps2 } }) => {
           return (ps1.precedence || Number.MAX_VALUE) - ( ps2.precedence || Number.MAX_VALUE);
          })
        .map(({ metaData: md, metaData: { preSort: ps } }) =>
          ({ active: md.key, direction: ps.direction }));
    }));
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
}

export type direc = 'asc' | 'desc' | boolean;
