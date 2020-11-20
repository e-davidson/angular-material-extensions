import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MaterialModule } from '../../material.module';
import { FilterComponent } from '../filter/filter.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldType } from '../../interfaces/report-def';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SpaceCasePipe } from '../../pipes/space-case.pipes';
import { DateFilterComponent } from '../date-filter/date-filter.component';
import { FilterType } from '../../enums/filterTypes';
import { TableStateManager } from '../../classes/table-store';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatButtonHarness} from '@angular/material/button/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { OptionHarnessFilters } from '@angular/material/core/testing';
import { TableBuilderConfigToken } from '../../classes/TableBuilderConfig';
import { provideMockStore } from '@ngrx/store/testing';

function fillInput<T>(fixture: ComponentFixture<T>, name: string, value: string) {
  const input = fixture.debugElement.query(By.css('input[name=' + name + ']')).nativeElement as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

async function setSelect(loader: HarnessLoader, filter: Pick<OptionHarnessFilters, 'isSelected' | 'selector' | 'text'>) {
  const select = await loader.getHarness<MatSelectHarness>(MatSelectHarness);
  await select.open();
  await select.clickOptions(filter);
}

describe('filter component', () => {

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [FilterComponent, DatePipe, SpaceCasePipe, DateFilterComponent],
      providers: [
        DatePipe,
        TableStateManager,
        { provide : TableBuilderConfigToken , useValue: {defaultTableState: { }}},
        provideMockStore({ initialState: {} }),
      ],
      imports: [
        NoopAnimationsModule,
        MaterialModule,
        CommonModule,
        FormsModule,
      ]
    })
      .compileComponents();
  });

  it('filter info object should be populated', async () => {
    const fixture = TestBed.createComponent(FilterComponent);
    const component = fixture.componentInstance;
    const spy = spyOn(component.state, 'addFilter');

    spy.and.callFake( a => {
      expect(a.filterType).toBe(FilterType.StringContains);
      expect(a.filterValue).toBe('a');
    });

    component.filter = {
      key: 'name',
      fieldType: FieldType.String
    };

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const button = await loader.getHarness<MatButtonHarness>(MatButtonHarness.with( {text: 'Apply'}));

    await setSelect(loader, {text: 'Contains'});
    fillInput(fixture, 'filterValue', 'a');
    await button.click();

    expect(spy).toHaveBeenCalled();
  });
});
