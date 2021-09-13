import { of } from 'rxjs';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MaterialModule } from '../../material.module';
import { SpaceCasePipe } from '../../pipes/space-case.pipes';
import { FilterComponent } from '../filter/filter.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldType } from '../../interfaces/report-def';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DateFilterComponent } from '../date-filter/date-filter.component';
import { TableContainerComponent } from './table-container';
import { GenFilterDisplayerComponent } from '../table-container-filter/gen-filter-displayer/gen-filter-displayer.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { GenColDisplayerComponent } from '../gen-col-displayer/gen-col-displayer.component';
import { ColumnTotalPipe } from '../../pipes/column-total.pipe';
import { TableBuilder } from '../../classes/table-builder';
import { MultiSortDirective } from '../../directives/multi-sort.directive';
import { TableBuilderConfigToken } from '../../classes/TableBuilderConfig';
import { provideMockStore } from '@ngrx/store/testing';
import { PaginatorComponent } from '../generic-table/paginator.component';


const data = [
  {
    name: 'Joe',
    age: 10,
    balance: 25
  },
  {
    name: 'Jane',
    age: 20,
    balance: 35
  }
];
const metaData =  [
  {
    key: 'name',
    fieldType: FieldType.String,
    additional: {},
    order : 1
  },
  {
    key: 'age',
    fieldType: FieldType.Number,
    additional: {},
    order : 2
  },
  {
    key: 'balance',
    fieldType: FieldType.Number,
    additional: {},
    order : 3
  }
];

const initialState = {fullTableState: {
  'test-id': {
    metaData,
    hiddenKeys: [],
    pageSize: 10,
    initialized : true ,
    filters: [],
  }
}};
describe('table container', () => {
  let fixture: ComponentFixture<TableContainerComponent>;
  let component: TableContainerComponent;
  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        TableContainerComponent,
        FilterComponent,
        GenFilterDisplayerComponent,
        GenericTableComponent,
        PaginatorComponent,
        GenColDisplayerComponent,
        SpaceCasePipe,
        ColumnTotalPipe,
        DateFilterComponent,
        MultiSortDirective,
      ],
      providers: [
       { provide : TableBuilderConfigToken , useValue: {defaultTableState: { }}},
       provideMockStore({ initialState }),
       DatePipe,
      ],
      imports: [
        NoopAnimationsModule,
        MaterialModule,
        CommonModule,
        FormsModule,
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TableContainerComponent);
    component = fixture.componentInstance;
  });

  it('can create component', () => {
    component.tableId = 'test-id';
    component.tableBuilder = new TableBuilder(of(data));
    fixture.detectChanges();
    expect(component).toBeDefined();
  });
});
