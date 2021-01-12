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
import { MatHeaderCellDef, MatRowDef, MatTable } from '@angular/material/table';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { TableStore } from '../../classes/table-store';
import { tap, map, distinct } from 'rxjs/operators';
import { ColumnBuilderComponent } from '../column-builder/column-builder.component';
import { ColumnInfo } from '../table-container/table-container';
import { Dictionary } from '../../interfaces/dictionary';
import { GenericTableDataSource } from '../../classes/GenericTableDataSource';
import {CdkDropList, CDK_DROP_LIST, DragDrop} from '@angular/cdk/drag-drop'

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

  @Input() columnInfos: Observable<ColumnInfo[]>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(CdkDropList, {static: true}) dropList: CdkDropList;
  @ViewChild('table', {read: ElementRef}) tableElRef: ElementRef;
  @ViewChild(MatHeaderCellDef ) headerRow: MatHeaderCellDef;

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
    private DragDrop : DragDrop,
    ) {
    
      
      this.factory = componentFactoryResolver.resolveComponentFactory(ColumnBuilderComponent);
    this.injector = Injector.create({ providers:
      [
        {provide: MatTable, useFactory: ()=> {return this.table;} },
        {provide: CDK_DROP_LIST,useFactory: () => { debugger; return this.dropList;} }
      ], parent: injector});
  }
  ref
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

    this.state.on(this.columnInfos, columns => {
      columns.forEach( ci => this.addMetaData(ci) );
      
      // Object.values(this.myColumns).forEach(col => this.DragDrop.createDrag(col.columnDef))
    });
    this.state.on(this.state.displayedColumns$, keys => {
      this.keys = [...this.columns, ...keys]} );
  }

  ngAfterViewInit(){
    this.dropList.dropped.subscribe( d => console.log(d));
   // this.ref = this.DragDrop.createDropList(this.headerRow.nativeElement);
    // console.log(this.headerRow.nativeElement.children)
      console.log(this.tableElRef)
      // Object.values(this.myColumns).forEach(a=> console.log(a.columnDef.headerCell))
      // const r = [...this.headerRow.nativeElement.children];
      // const refs = r.map(r=>this.DragDrop.createDrag(r));
      // this.ref.withItems(refs)
      // console.log(ref.getItemIndex(refs[1]))
      this.ref.dropped.subscribe(a=>console.log(a,'here'))
  }

  createDataSource() { 
    this.dataSource = new GenericTableDataSource(
      this.data$.pipe(tap((d) => this.selection.clear() ))
    );
    this.dataSource.sort = this.sort;

    this.dataSource.paginator = this.paginator;
    this.state.setPageSize(this.paginator.page.pipe(map( e => e.pageSize ), distinct()));
  }

  drop(a){console.log(a)}
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
  @Output() selection$: Observable<any> = this.selection.changed;
  masterToggleChecked$ = this.selection$.pipe(map(()=>this.selection.hasValue() && this.isAllSelected()));
  masterToggleIndeterminate$ = this.selection$.pipe(map(()=>this.selection.hasValue() && !this.isAllSelected()));
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

  tableWidth = this.state.getUserDefinedTableSize$.pipe(map(w => ({width:`${w}px`})));
}

export type direc = 'asc' | 'desc' | boolean;
