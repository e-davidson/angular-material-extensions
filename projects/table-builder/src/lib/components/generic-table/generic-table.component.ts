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
  ChangeDetectorRef,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatRowDef, MatTable } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import * as _ from 'lodash';
import { MatTableObservableDataSource } from '../../classes/MatTableObservableDataSource';
import { SelectionModel } from '@angular/cdk/collections';
import { TableStore } from '../../classes/table-store';
import { tap,  map, distinct } from 'rxjs/operators';
import { ColumnBuilderComponent } from '../column-builder/column-builder.component';
import { ColumnInfo, TableContainerComponent } from '../table-container/table-container';
import { Dictionary } from '../../interfaces/dictionary';
import { FieldType } from '../../interfaces/report-def';

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
  @Input() columnBuilders: ColumnBuilderComponent[];
  @Output() selection$: Observable<any>;

  @Input() columnInfos:ColumnInfo[];




  subs: Subscription[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild('table', {read: ElementRef}) tableElRef: ElementRef;

  currentColumns: string[];
  selection: SelectionModel<any>;
  dataSource: MatTableObservableDataSource<any>;
  keys: string [] = [];
  factory: ComponentFactory<ColumnBuilderComponent> ;
  constructor(
    private sort: MatSort,
    public state: TableStore,
    componentFactoryResolver: ComponentFactoryResolver,
    private viewContainer: ViewContainerRef,
    private tableContainer: TableContainerComponent,
    private cdr: ChangeDetectorRef
    ) {
    this.selection = new SelectionModel<any>(true, []);
    this.selection$ = this.selection.changed;
    this.factory = componentFactoryResolver.resolveComponentFactory(ColumnBuilderComponent);
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
    if ( changes.columnInfos){
      this.columnInfos.forEach( ci => this.addMetaData(ci) ) ;
    }
  }

  ngOnInit() {
    if (this.SelectionColumn) {
      this.state.setMetaData({ key: 'select', fieldType: FieldType.Unknown });
    }
    if (this.IndexColumn) {
      this.state.setMetaData({ key: 'index', fieldType: FieldType.Unknown });
    }
    this.createDataSource();

    this.state.effect((o$: Observable<string[]>) => {
      return o$.pipe(
        tap((d: string[]) => {
          setTimeout(() => {
            this.rows.forEach(r => r.columns = d);
            this.keys = d;
            this.cdr.detectChanges();
          }, 0);
        }
        )
      );
    })(this.state.displayedColumns$);
  }

  createDataSource() {
    this.dataSource = new MatTableObservableDataSource(
      this.data$.pipe(tap((d) => this.selection.clear() ))
    );
    this.dataSource.sort = this.sort;

    this.dataSource.paginator = this.paginator;
    this.state.setPageSize(this.paginator.page.pipe(map( e => e.pageSize ), distinct()));
  }

  myColumns: Dictionary<ColumnBuilderComponent> = {};
  needsInit: string [] = [];
  addMetaData(column: ColumnInfo) {
    console.count(column.metaData.key);
    let columnBuilder = this.myColumns[column.metaData.key];
    if(columnBuilder) {
      columnBuilder.metaData = column.metaData;
    } else {
      const component = this.viewContainer.createComponent(this.factory);
      component.instance.customCell = column.customCell;
      component.instance.metaData = column.metaData;
      component.instance.data$ = this.data$;
      this.myColumns[column.metaData.key] = component.instance;
      this.needsInit.push(column.metaData.key);
    }
  }

  ngAfterViewChecked() {
    console.count('gt after view checked');
    console.log(this.needsInit.length);
    if(this.needsInit.length > 0 ) {
      this.needsInit.forEach( key => this.table.addColumnDef( this.myColumns[key].columnDef ));
      this.needsInit = [];
      this.cdr.detectChanges();
    }
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
