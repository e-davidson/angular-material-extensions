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
  ElementRef,
  ComponentFactory,
  Injector,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatRowDef, MatTable } from '@angular/material/table';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { TableStore } from '../../classes/table-store';
import { tap, map, distinct } from 'rxjs/operators';
import { ColumnBuilderComponent } from '../column-builder/column-builder.component';
import { ColumnInfo } from '../table-container/table-container';
import { Dictionary } from '../../interfaces/dictionary';
import { GenericTableDataSource } from '../../classes/GenericTableDataSource';

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
  @Input() columnBuilders: ColumnBuilderComponent[];
  @Output() selection$: Observable<any>;

  @Input() columnInfos: Observable<ColumnInfo[]>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('table', {read: ElementRef}) tableElRef: ElementRef;

  currentColumns: string[];

  dataSource: GenericTableDataSource<any>;
  keys: string [] = [];
  factory: ComponentFactory<ColumnBuilderComponent> ;
  injector: Injector;
  constructor(
    private sort: MatSort,
    public state: TableStore,
    componentFactoryResolver: ComponentFactoryResolver,
    private viewContainer: ViewContainerRef,
    injector: Injector,
    ) {
    
    this.factory = componentFactoryResolver.resolveComponentFactory(ColumnBuilderComponent);
    this.injector = Injector.create({ providers: [{provide: MatTable, useFactory: ()=> {return this.table} }], parent: injector});
  }

  paginatorChange(): void {
    setTimeout(() => this.tableElRef?.nativeElement?.scrollIntoView(), 0);
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
  columns:string [] = [];
  ngOnInit() {
    if (this.SelectionColumn) {
      this.columns.push('select');
    }
    if (this.IndexColumn) {
     this.columns.push('index');
    }
    this.createDataSource();

    this.state.on(this.columnInfos, columns => columns.forEach( ci => this.addMetaData(ci) ));
    this.state.on(this.state.displayedColumns$, keys => this.keys = [...this.columns, ...keys] );
  }

  createDataSource() {
    this.dataSource = new GenericTableDataSource(
      this.data$.pipe(tap((d) => this.selection.clear() ))
    );
    this.dataSource.sort = this.sort;

    this.dataSource.paginator = this.paginator;
    this.state.setPageSize(this.paginator.page.pipe(map( e => e.pageSize ), distinct()));
  }

  myColumns: Dictionary<ColumnBuilderComponent> = {};

  addMetaData(column: ColumnInfo) {
    let columnBuilder = this.myColumns[column.metaData.key];
    if(columnBuilder) {
      columnBuilder.metaData = column.metaData;
    } else {
      const component = this.viewContainer.createComponent(this.factory,0, this.injector);
      component.instance.customCell = column.customCell;
      component.instance.metaData = column.metaData;
      component.instance.data$ = this.data$;
      this.myColumns[column.metaData.key] = component.instance;
    }
  }
  selection : SelectionModel<any> = new SelectionModel<any>(true, []);
  selection$ = this.selection.changed;
  masterToggleSelected$;
  setUpSelectionStreams(){
    this.selection = new SelectionModel<any>(true, []);
    this.selection$ = this.selection.changed;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    console.count('object')
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.selection.select(...this.dataSource.data);
  }
}

export type direc = 'asc' | 'desc' | boolean;
