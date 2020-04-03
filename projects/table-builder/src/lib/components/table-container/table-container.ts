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
  ViewChild,
  TemplateRef
} from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { map, shareReplay } from 'rxjs/operators';
import { TableBuilder } from '../../classes/table-builder';
import { MatColumnDef, MatRowDef } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { ColumnBuilderComponent, TemplateHolder } from '../column-builder/column-builder.component';
import { CustomCellDirective } from '../../directives';
import { TableStateManager } from '../../classes/table-state-manager';
import * as _ from 'lodash';
import { Template } from '@angular/compiler/src/render3/r3_ast';


@Component({
  selector: 'tb-table-container',
  templateUrl: './table-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TableStateManager]
}) export class TableContainerComponent {
  _tableId: string;
  @Input() set tableId(value: string) {
    this._tableId = value;
    this.state.tableId = this._tableId;

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

  @Output() OnStateReset = new EventEmitter();
  @Output() OnSaveState = new EventEmitter();

  @ViewChild('body', {static: true}) bodyTemplate: TemplateRef<any>;
  @ViewChild('customCellWrapper') customCellWrapper: TemplateRef<any>;

  hiddenFields: string [] = [];
  columns: MatColumnDef[];
  filtersExpanded = false;
  rules$: Observable<Sort[]>;
  FieldType = FieldType;
  filteredData: Observable<any[]>;

  myColumns$: Observable<Partial<ColumnInfo>[]>;

  constructor(
      private cdr: ChangeDetectorRef,
      public state: TableStateManager
    ) { }



  ngOnInit() {
    this.InitializeData();
  }

  ngAfterContentInit() {
    this.InitializeColumns();
  }

  InitializeData() {
    this.filteredData = this.state.getFilteredData$(this.tableBuilder.getData$(), this.inputFilters)
  }

  exportToCsv() {
    this.state.exportToCsv(this.tableBuilder.getData$());
  }

  InitializeColumns() {

    this.myColumns$ = this.tableBuilder.metaData$.pipe(
      map( metaDatas => {

        const customCellMap = new Map(this.customCells.map(cc => [cc.customCell,cc]));

        const metas: ColumnInfo[] = metaDatas.map(metaData => {
          const customCell = popFromMap(metaData.key, customCellMap);
          if(metaData.fieldType === FieldType.Hidden){
            this.state.hideColumn(metaData.key);
          }
          const md = {...metaData, ...customCell?.getMetaData(metaData)};
          return { metaData:{...metaData,...customCell?.getMetaData(metaData)}, customCell };
        })
        const customNotMetas = [...customCellMap.values()]
          .map( customCell =>({
            metaData: customCell.getMetaData(),
            customCell}));
        const fullArr = metas.concat(customNotMetas);
        return fullArr;
      }),
      shareReplay()
    );

    this.subscriptions.push(this.myColumns$.pipe(map(columns => _.orderBy( columns.map( column => column.metaData ), 'order' )   ))
      .subscribe( columns => {this.state.setMetaData(columns);})
    );

    this.preSort();

  }

  ngAfterViewInit() {
    console.log('after view container');
    setTimeout(() => {
      this.columns = this.columnBuilders.map( cb => cb.columnDef );
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
  resort$ = new Subject<{}>();
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (!this.SaveState || !this._tableId) {
      this.state.destroy();
    }
  }
}

function popFromMap(key:string, map: Map<string, CustomCellDirective>){
  const customCell = map.get(key);
  map.delete(key);
  return customCell;
}

interface ColumnInfo {
  metaData: MetaData,
  customCell: CustomCellDirective
}
