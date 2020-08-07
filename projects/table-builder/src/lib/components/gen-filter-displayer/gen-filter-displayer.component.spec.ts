import { of } from 'rxjs';
import { skip } from 'rxjs/operators';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { GenFilterDisplayerComponent } from './gen-filter-displayer.component';
import { MaterialModule } from '../../material.module';
import { SpaceCasePipe } from '../../pipes/space-case.pipes';
import { FilterComponent } from '../filter/filter.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldType } from '../../interfaces/report-def';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DateFilterComponent } from '../date-filter/date-filter.component';
import { FilterType } from '../../enums/filterTypes';
import { TableBuilderModule } from '../../table-builder.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TableStateManager } from '../../classes/table-state-manager';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';


function getMetaData() {
  return of([
    {
      key: 'name',
      displayName: 'first name',
      fieldType: FieldType.String,
      additional: {},
      order: 1
    },
    {
      key: 'last',
      displayName: 'last name',
      fieldType: FieldType.String,
      additional: {},
      order: 2
    }
  ]);
}

describe('generic filter displayer', () => {
  let fixture: ComponentFixture<GenFilterDisplayerComponent>;
  let component: GenFilterDisplayerComponent;

  const clickFilter = (idx: number) => {
    const btn = fixture.debugElement.query(By.css('.filter-button')).nativeElement;

    btn.click();
    fixture.detectChanges();
    const menu = fixture.debugElement.queryAll(By.css('.mat-menu-item'));
    menu[idx].nativeElement.click();
    fixture.detectChanges();
  };
  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        GenFilterDisplayerComponent,
        SpaceCasePipe,
        FilterComponent,
        DateFilterComponent,
      ],
      providers: [TableStateManager],
      imports: [
        NoopAnimationsModule,
        MaterialModule,
        CommonModule,
        FormsModule,
        TableBuilderModule.forRoot({ defaultTableState: { sorted: []} }),
        StoreModule.forRoot({}),
        EffectsModule.forRoot([])]
    })
      .compileComponents();
    fixture = TestBed.createComponent(GenFilterDisplayerComponent);
    component = fixture.componentInstance;
    component.filterCols$ = getMetaData();
    component.tableState.initializeState();
    fixture.detectChanges();
  });

  it('should get the generic filter displayer component', () => {
    expect(component).toBeDefined();
  });

  it('should be able to create a filter', () => {

    clickFilter(0);
    const filter = fixture.debugElement.queryAll(By.directive(FilterComponent));
    expect(filter.length).toBe(1);

  });

  it('should emit filter',
    async (done: DoneFn) => {
      component.tableState.filters$.subscribe(
        () => done()
      );


      clickFilter(0);
      expect(fixture.componentInstance.currentFilters.length).toBe(1);
      const filter = fixture.debugElement.queryAll(By.directive(FilterComponent))[0].componentInstance as FilterComponent;
      const loader = TestbedHarnessEnvironment.loader(fixture);
      const button = await loader.getHarness<MatButtonHarness>(MatButtonHarness.with({ text: 'Apply' }));
      filter.currentFilterType = FilterType.StringEquals;
      filter.filter = {
        key: 'key',
        fieldType: FieldType.String,
        filterValue: 'a',
        filterType: FilterType.StringEquals
      };

      await button.click();

    });

  it('should emit valid filter that filters data',
    async (done: DoneFn) => {

      const fltr = component.tableState.getFilteredData$(of([{
        name: 'bob',
        age: 10
      },
      {
        name: 'john',
        age: 11
      },
      {
        name: 'sally',
        age: 12
      }
      ]))


      fltr.pipe(skip(1)).subscribe(d => {
        expect(d.length).toBe(1);
        done();
      });

      clickFilter(0);

      const filter = fixture.debugElement.queryAll(By.directive(FilterComponent))[0].componentInstance as FilterComponent;

      filter.currentFilterType = FilterType.StringEquals;
      filter.filter = {
        key: 'name',
        fieldType: FieldType.String,
        filterValue: 'bob',
        filterType: FilterType.StringEquals
      };

      const loader = TestbedHarnessEnvironment.loader(fixture);
      const button = await loader.getHarness<MatButtonHarness>(MatButtonHarness.with({ text: 'Apply' }));

      await button.click();
    });

});
