import {
  Component,
  ViewChild,
  Input,
  ChangeDetectionStrategy,
  Output,
  SimpleChanges,
  OnInit,
  QueryList,
  ComponentFactoryResolver,
  ViewContainerRef,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatRowDef, MatTable } from '@angular/material/table';
import { Observable, Subscription, of } from 'rxjs';
import * as _ from 'lodash';
import { MatTableObservableDataSource } from '../../classes/MatTableObservableDataSource';
import { SelectionModel } from '@angular/cdk/collections';
import { MultiSortDirective } from '../../directives/multi-sort.directive';
import { orderBy } from 'lodash';
import { combineArrays } from '../../functions/rxjs-operators';
import { TableStateManager } from '../../classes/table-state-manager';
import { tap,  map, distinct } from 'rxjs/operators';
import { ColumnBuilderComponent } from '../column-builder/column-builder.component';
import { ColumnInfo } from '../table-container/table-container';

@Component({
  selector: 'tb-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericTableComponent implements OnInit {

  @Input() data$: Observable<any[]>;
  @Input() IndexColumn = false;
  @Input() SelectionColumn = false;
  @Input() trackBy: string;
  @Input() rows: QueryList<MatRowDef<any>>;
  @Input() isSticky = false;
  @Input() pageSize: number;
  columnBuilders: ColumnBuilderComponent[];
  @Output() selection$: Observable<any>;

  @Input() columnInfos:ColumnInfo[];


  subs: Subscription[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  currentColumns: string[];
  selection: SelectionModel<any>;
  dataSource: MatTableObservableDataSource<any>;
  keys: string [] = [];

  constructor(
    private sort: MatSort,
    public state: TableStateManager,
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainer: ViewContainerRef,
    ) {
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
    if ( changes.columnInfos && this.columnInfos ) {
        this.initColumns();
    }
  }

  ngOnInit() {
    this.createDataSource();
  }

  createDataSource() {
    this.dataSource = new MatTableObservableDataSource(
      this.data$.pipe(tap((d) => this.selection.clear() ))
    );
    this.dataSource.sort = this.sort;
    this.dataSource.sortData = (data: {}[], sort: MultiSortDirective) =>
      orderBy(data, sort.rules?.map(r => r.active), sort.rules?.map(r => r.direction as direc ));
    this.dataSource.paginator = this.paginator;
    this.subs.push(this.paginator.page.pipe(map( e => e.pageSize ), distinct()).subscribe( size => {
      this.state.updateState( { pageSize: size});
    }));
  }
  init = false;
  ngAfterContentChecked() {
    if ( this.init) {
      this.init = false;
      this.columnBuilders.forEach( cb => this.table.addColumnDef(cb.columnDef));
    }
  }
  initColumns() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(ColumnBuilderComponent);
    this.columnBuilders = this.columnInfos.map(column => {
      const component = this.viewContainer.createComponent(factory);
      component.instance.customCell = column.customCell;
      component.instance.metaData = column.metaData;
      component.instance.data$ = this.data$;
      return component.instance;
    });
    const staticColumns = [];
    if (this.SelectionColumn) {
      staticColumns.push('select');
    }
    if (this.IndexColumn) {
      staticColumns.push('index');
    }
    this.init = true;

    const _keys = this.columnBuilders.map( cb => cb.metaData.key );

    const keys$ = combineArrays(
      [
        of(staticColumns) ,
        this.state.displayedColumns$.pipe(map( dc =>  dc.filter( c => _keys.includes(c))))
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

    this.subs.push(keys$.subscribe( k => this.keys = k));
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
      this.selection.select(...this.dataSource.data);
  }

  ngOnDestroy() {
    this.subs.forEach( sub => sub.unsubscribe());
  }
}

export type direc = 'asc' | 'desc' | boolean;
