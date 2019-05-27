import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableBuilderExampleComponent } from './table-builder-example.component';

describe('TableBuilderExampleComponent', () => {
  let component: TableBuilderExampleComponent;
  let fixture: ComponentFixture<TableBuilderExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableBuilderExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableBuilderExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
