import {
  Component,
  Input,
  EventEmitter,
  Output,
  ContentChildren,
  QueryList,
  ChangeDetectionStrategy,
  ViewChildren,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { map, publishReplay, refCount } from 'rxjs/operators';
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
  @Input() tableId;
  @Input() SaveState = false;
  @Input() tableBuilder: TableBuilder;
  @Input() IndexColumn = false;
  @Input() SelectionColumn = false;
  @Input() trackBy: string;
  @Input() isSticky = true;
  @Input() pageSize;
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

  myColumns2: Observable<ColumnBuilderComponent[]>;
  constructor( public state: TableStateManager) {}


  ngOnInit() {
    this.InitializeData();
    this.InitTableState();
  }

  InitTableState() {
    if (this.tableId) {
      this.state.tableId = this.tableId;
    }
    this.state.initializeState();
    if (this.pageSize) {
      this.state.updateState( { pageSize: this.pageSize});
    }
  }

  ngAfterContentInit() {
    this.InitializeColumns();
  }

  InitializeData() {
    this.filteredData = this.state.getFilteredData$(this.tableBuilder.getData$(), this.inputFilters);
    this.subscriptions.push(this.filteredData.subscribe( d => this.data.next(d)));
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
          return { metaData:{...metaData,...customCell?.getMetaData(metaData)}, customCell };
        })
        const customNotMetas = [...customCellMap.values()]
          .map( customCell =>({
            metaData: customCell.getMetaData(),
            customCell}));
        const fullArr = metas.concat(customNotMetas);
        return fullArr;
      }),
      publishReplay(1),
      refCount(),
    );

    this.subscriptions.push(this.myColumns$.pipe(map(columns => _.orderBy( columns.map( column => column.metaData ), 'order' )   ))
      .subscribe( (columns: MetaData []) => {
        this.state.setMetaData(columns);
      })
    );

    this.preSort();

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
      publishReplay(1), refCount());
  }
  resort$ = new Subject<{}>();
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (!this.SaveState || !this.tableId) {
      this.state.destroy();
    }
  }
}

function popFromMap(key:string, map: Map<string, CustomCellDirective>){
  const customCell = map.get(key);
  map.delete(key);
  return customCell;
}

export interface ColumnInfo {
  metaData: MetaData,
  customCell: CustomCellDirective
}
