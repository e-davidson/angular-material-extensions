import {
  Component,
  Input,
  EventEmitter,
  Output,
  ContentChildren,
  QueryList,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { Observable, Subject, concat } from 'rxjs';
import { FieldType, MetaData } from '../../interfaces/report-def';
import { first, map } from 'rxjs/operators';
import { FilterInfo } from '../../classes/filter-info';
import { DataFilter } from '../../classes/data-filter';
import { mapArray } from '../../functions/rxjs-operators';
import { TableBuilder } from '../../classes/table-builder';
import { MatRowDef, MatColumnDef } from '@angular/material/table';
import { TableTemplateBuilder } from '../../classes/TableTemplateBuilder';
import { ColumnTemplates } from '../../interfaces/column-template';
import { CustomCellDirective } from '../../directives/custom-cell-directive';


@Component({
  selector: 'tb-table-container',
  templateUrl: './table-container.html',
  changeDetection: ChangeDetectionStrategy.OnPush
}) export class TableContainerComponent {

  @Input() tableBuilder: TableBuilder;
  @Input() IndexColumn = false;
  @Input() SelectionColumn = false;
  @Input() trackBy: string;
  @Input() isSticky: boolean = true;
  @Input() pageSize: number = 20;
  @Output() filters$ = new EventEmitter();
  @Output() selection$ = new EventEmitter();
  @ViewChild('header', { static: true }) header: TemplateRef<any>;
  @ViewChild('body', { static: true }) body: TemplateRef<any>;
  @ViewChild('footer', { static: true }) footer: TemplateRef<any>;
  @ContentChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef>;
  @ContentChildren(MatRowDef) customRows: QueryList<MatRowDef<any>>;
  @ContentChildren(CustomCellDirective) customCells: QueryList<CustomCellDirective>;

  FieldType = FieldType;
  displayedColumns$: Observable<string[]>;
  columnsSelected$ = new Subject<string[]>();
  columnNames$: Observable<MetaData[]>;
  filteredData: DataFilter;
  columnTemplates$: Observable<ColumnTemplates[]>;
  filterCols$: Observable<MetaData[]>;

  ngAfterContentInit() {
    this.InitializeData();
    this.InitializeColumns();
  }

  InitializeData() {
    this.filteredData = new DataFilter(
      this.filters$.pipe(
        mapArray((fltr: FilterInfo) => fltr.getFunc())
      ),
      this.tableBuilder.getData$()
    );

    this.filterCols$ = this.tableBuilder.metaData$.pipe(
      map(md => md.filter(m => m.fieldType !== FieldType.Hidden))
    );
  }

  InitializeColumns() {
    const t = new TableTemplateBuilder(
      this.tableBuilder,
      this.header,
      this.body,
      this.footer,
      this.columnDefs.toArray(),
      this.customCells.toArray()
    );
    this.columnNames$ = t.getColumnNames();
    this.displayedColumns$ = concat(
      this.columnNames$.pipe(first(), map(cols => cols.map(c => c.key))),
      this.columnsSelected$
    );

    this.columnTemplates$ = t.getColumnTemplates();
  }

}
