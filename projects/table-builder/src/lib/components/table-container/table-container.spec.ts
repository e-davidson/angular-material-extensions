import { of } from 'rxjs';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MaterialModule } from '../../material.module';
import { SpaceCasePipe } from '../../pipes/space-case.pipes';
import { FilterComponent } from '../filter/filter.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldType } from '../../interfaces/report-def';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DateFilterComponent } from '../date-filter/date-filter.component';
import { TableContainerComponent } from './table-container';
import { GenFilterDisplayerComponent } from '../gen-filter-displayer/gen-filter-displayer.component';
import { GenericTableComponent } from '../generic-table/generic-table.component';
import { GenValDisplayerComponent } from '../gen-val-displayer/gen-val-displayer.component';
import { GenColDisplayerComponent } from '../gen-col-displayer/gen-col-displayer.component';
import { ColumnTotalPipe } from '../../pipes/column-total.pipe';
import { TableBuilder } from '../../classes/table-builder';
import { MultiSortDirective } from '../../directives/multi-sort.directive';


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

function getMetaData() {
  return of( [
    {
      key: 'name',
      displayName: 'first name',
      fieldType: FieldType.String,
      additional: {},
      order : 1
    },
    {
      key: 'last',
      displayName: 'last name',
      fieldType: FieldType.String,
      additional: {},
      order : 2
    }
  ]);
}



describe('table container', () => {
  let fixture: ComponentFixture<TableContainerComponent>;
  let component: TableContainerComponent;
  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        TableContainerComponent,
        FilterComponent,
        GenFilterDisplayerComponent,
        GenValDisplayerComponent,
        GenericTableComponent,
        GenColDisplayerComponent,
        SpaceCasePipe,
        ColumnTotalPipe,
        DateFilterComponent,
        MultiSortDirective
      ],
      providers: [  ],
      imports: [ NoopAnimationsModule, MaterialModule, CommonModule, FormsModule ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(TableContainerComponent);
    component = fixture.componentInstance;
  });

  it('can create component', () => {
    component.tableBuilder = new TableBuilder(of(data));
    fixture.detectChanges();
    expect(component).toBeDefined();
  });


});
