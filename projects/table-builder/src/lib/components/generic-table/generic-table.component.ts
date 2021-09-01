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
import { asyncScheduler, merge, Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { TableStore } from '../../classes/table-store';
import { tap, map, distinct, delay, distinctUntilKeyChanged } from 'rxjs/operators';
import { ColumnBuilderComponent } from '../column-builder/column-builder.component';
import { ColumnInfo } from '../table-container/table-container';
import { Dictionary } from '../../interfaces/dictionary';
import { GenericTableDataSource } from '../../classes/GenericTableDataSource';
import { FieldType } from '../../interfaces/report-def';
import { previousAndCurrent } from '../../functions/rxjs-operators';

@Component({
  selector: 'tb-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss','../../styles/collapser.styles.scss'],
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

  trackByFunction = (index, item) => {
    if (!item) {
      return null;
    }
    if (this.trackBy) {
      return item[this.trackBy];
    }
    return item;
  }
  rowDefArr :MatRowDef<any>[]= [];
  columns:string [] = [];
  ngOnChanges(changes: SimpleChanges) {
    if (changes.rows && this.rows && this.myColumns.length) {
      this.initializeRowDefs([...this.rows]);
    }
  }

  ngOnInit() {
    if (this.SelectionColumn) {
      this.columns.push('select');
    }
    if (this.IndexColumn) {
     this.columns.push('index');
    }
    this.createDataSource();

    this.state.on(this.columnInfos, columns => {
      columns.forEach( ci => this.addMetaData(ci) )});
      this.initializeRowDefs([...this.rows]);
    this.state.on(this.state.displayedColumns$, keys => {
      this.keys = [...this.columns, ...keys];
      this.rowDefArr?.forEach(row => row.columns = this.keys)
    
    } );
     
  }
  collapseFooter = false;
  ngAfterViewInit(){
    this.pageData$ = merge(
       this.paginator.page.pipe(
      map(
      pageData => ({
      currentStart : (pageData.pageIndex * pageData.pageSize) + 1,
      currentEnd : Math.min(pageData.length , ((pageData.pageIndex + 1) * pageData.pageSize)),
      total : pageData.length
    }))),
    this.data$.pipe(distinctUntilKeyChanged("length"),delay(0,asyncScheduler), map(a => ({currentStart:(this.paginator.pageIndex * this.paginator.pageSize) + 1,
        currentEnd: Math.min(this.paginator.length , ((this.paginator.pageIndex + 1) * this.paginator.pageSize)),
        total:this.paginator.length})))
        );
  }
  pageData$: Observable<{currentStart:number,currentEnd:number,total:number}>;

  paginatorChange() : void {
    if(!this.ourPageEvent){
      setTimeout(() => this.tableElRef?.nativeElement?.scrollIntoView(), 0);
    } else {
      this.ourPageEvent = false;
    }
  }
  ourPageEvent = false;
  createDataSource() { 
    this.dataSource = new GenericTableDataSource(
      this.data$.pipe(tap((d) => this.selection.clear() ))
    );
    this.dataSource.sort = this.sort;

    this.dataSource.paginator = this.paginator;
    this.ourPageEvent = true;
    this.state.on(this.state.state$.pipe(map(state => state.pageSize),distinct()), pageSize => this.paginator._changePageSize(pageSize));
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

  initializeRowDefs = (defs:MatRowDef<any>[])=>{
    this.rowDefArr.forEach(r=>this.table.removeRowDef(r));
    this.rowDefArr = defs;
    defs.forEach(r => {
      r.columns = this.columns.concat(Object.values(this.myColumns).filter(c => c.metaData.fieldType !== FieldType.Hidden).map(c => c.metaData.key));
      if (this.table) {
        this.table.addRowDef(r);
      }
    });
  }
  selection : SelectionModel<any> = new SelectionModel<any>(true, []);
  @Output() selection$: Observable<any> = this.selection.changed;
  masterToggleChecked$ = this.selection$.pipe(map(()=>this.selection.hasValue() && this.isAllSelected()));
  masterToggleIndeterminate$ = this.selection$.pipe(map(()=>this.selection.hasValue() && !this.isAllSelected()));
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

  tableWidth = this.state.getUserDefinedTableSize$.pipe(
    previousAndCurrent(0),
    map(([previousUserDefinedWidth, currentUserDefinedWidth] : [number, number]) => {
      if( currentUserDefinedWidth ){
        return ({width:`${currentUserDefinedWidth}px`});
      } if( wasReset() ){
        return ({width:'initial'});
      }
      return ({});

      function wasReset(){
        return previousUserDefinedWidth >=0 && currentUserDefinedWidth == null;
      }
    }));
}

export type direc = 'asc' | 'desc' | boolean;
