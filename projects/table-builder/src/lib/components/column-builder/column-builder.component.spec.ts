import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnBuilderComponent } from './column-builder.component';
import { FieldType } from '../../interfaces/report-def';
import { TableBuilderConfigToken } from '../../classes/TableBuilderConfig';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from '../../material.module';
import { SpaceCasePipe } from '../../pipes/space-case.pipes';

const initialState = {fullTableState: {
  'test-id': {
    metaData: [],
    hiddenKeys: [],
    pageSize: 10,
    initialized : true ,
  }
}};


describe('ColumnBuilderComponent', () => {
  let component: ColumnBuilderComponent;
  let fixture: ComponentFixture<ColumnBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnBuilderComponent, SpaceCasePipe ],
      providers: [
        { provide : TableBuilderConfigToken , useValue: {defaultTableState: { }}},
        provideMockStore({ initialState }),
      ],
      imports: [MaterialModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnBuilderComponent);
    component = fixture.componentInstance;
    component.metaData = { key: 'key', fieldType: FieldType.String };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
