import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MaterialModule } from '../../material.module';
import { FilterComponent } from '../filter/filter.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldType } from '../../interfaces/report-def';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FilterInfo } from '../../classes/filter-info';
import { SpaceCasePipe } from '../../pipes/space-case.pipes';
import { DateFilterComponent } from '../date-filter/date-filter.component';

describe('filter component', () => {


  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [FilterComponent, SpaceCasePipe, DateFilterComponent],
      providers: [],
      imports: [NoopAnimationsModule, MaterialModule, CommonModule, FormsModule]
    })
      .compileComponents();
  });


  it('filter info object should be populated', () => {
    const fixture = TestBed.createComponent(FilterComponent);
    const component = fixture.componentInstance;
    component.info = new FilterInfo({
      key: 'name',
      displayName: 'first name',
      fieldType: FieldType.String,
      additional: {},
      order: 1
    });

    fixture.detectChanges();

    const select = fixture.debugElement.queryAll(By.css('mat-select'));

    select[0].nativeElement.click();
    fixture.detectChanges();
    const m = fixture.debugElement.queryAll(By.css('mat-option'));

    m[0].nativeElement.click();

    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = 'a';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.info.filterType).toBe('Contains');
    expect(component.info.filterValue).toBe('a');

  });
});
