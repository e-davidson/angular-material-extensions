import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnBuilderComponent } from './column-builder.component';
import { FieldType } from '../../interfaces/report-def';

describe('ColumnBuilderComponent', () => {
  let component: ColumnBuilderComponent;
  let fixture: ComponentFixture<ColumnBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnBuilderComponent ]
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
