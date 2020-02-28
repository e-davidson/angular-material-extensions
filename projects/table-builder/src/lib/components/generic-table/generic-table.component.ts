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
  ChangeDetectorRef,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatRowDef, MatTable, MatColumnDef } from '@angular/material/table';
import { Observable, Subscription, of } from 'rxjs';
import * as _ from 'lodash';
import { MatTableObservableDataSource } from '../../classes/MatTableObservableDataSource';
import { SelectionModel } from '@angular/cdk/collections';
import { MultiSortDirective } from '../../directives/multi-sort.directive';
import { orderBy } from 'lodash';
import { combineArrays, filterArray } from '../../functions/rxjs-operators';
import { TableStateManager } from '../../classes/table-state-manager';
import { tap,  map, distinct, switchMap, shareReplay, scan } from 'rxjs/operators';
import { ColumnBuilderComponent } from '../column-builder/column-builder.component';

@Component({
  selector: 'tb-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericTableComponent implements AfterContentInit, OnInit {

  @Input() data$: Observable<any[]>;
  @Input() IndexColumn = false;
  @Input() SelectionColumn = false;
  @Input() trackBy: string;
  @Input() rows: QueryList<MatRowDef<any>>;
  @Input() isSticky = false;
  @Input() pageSize: number;
  @Input() columnBuilders: QueryList<ColumnBuilderComponent>;
  @Output() selection$: Observable<any>;

  subs: Subscription[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  currentColumns: string[];
  selection: SelectionModel<any>;
  dataSource: MatTableObservableDataSource<any>;
  keys$: Observable<string[]>;

  constructor(private sort: MatSort, public state: TableStateManager, private cdr: ChangeDetectorRef) {
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
    if ( changes.columnBuilders && this.columnBuilders ) {
        this.columnBuilders.forEach( cb => cb.columnDefs.forEach(cd => this.table.addColumnDef(cd)));
    }
  }

  ngOnInit() {
    this.createDataSource();
  }

  ngAfterContentInit() {
    this.initColumns();
  }

  createDataSource() {
    this.dataSource = new MatTableObservableDataSource(
      this.data$.pipe(tap((d) => this.selection.clear() ))
    );
    this.dataSource.sort = this.sort;
    this.dataSource.sortData = (data: {}[], sort: MultiSortDirective) =>
      orderBy(data, sort.rules.map(r => r.active), sort.rules.map(r => r.direction as direc ));
    this.dataSource.paginator = this.paginator;
    this.subs.push(this.paginator.page.pipe(map( e => e.pageSize ), distinct()).subscribe( size => {
      this.state.updateState( { pageSize: size});
    }));
  }

  initColumns() {
    const staticColumns = [];
    if (this.SelectionColumn) {
      staticColumns.push('select');
    }
    if (this.IndexColumn) {
      staticColumns.push('index');
    }

    const keysFromColumnBuilder = this.columnBuilders.changes.pipe(
      map( () => _.flatten(this.columnBuilders.map( cb => cb.columnDefs.toArray() ))),
      scan( (acc, current) => {
        return { current, previous: acc.current }
      }, {current: [], previous: []}),
      tap(
        (data: {current: MatColumnDef[],previous: MatColumnDef[]}) => {
          data.previous.forEach( cd => this.table.removeColumnDef(cd));
          data.current.forEach( cd => this.table.addColumnDef(cd));
          setTimeout(() => {
           this.cdr.detectChanges();
          }, 0);
        }
      ),
      shareReplay(),
      switchMap( () => this.state.displayedColumns$.pipe(
        filterArray( dc => this.columnBuilders.some( mcd => mcd.metaData.key === dc )),
      ) )
    );

    this.keys$ = combineArrays(
      [
        of(staticColumns),
        keysFromColumnBuilder
      ]
    ).pipe(
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

  ngOnDestroy() {
    this.subs.forEach( sub => sub.unsubscribe());
  }
}

export type direc = 'asc' | 'desc' | boolean;
