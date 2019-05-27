import { of } from 'rxjs';
import { skip, map } from 'rxjs/operators';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { GenFilterDisplayerComponent } from './gen-filter-displayer.component';
import { MaterialModule } from '../../material.module';
import { SpaceCasePipe } from '../../pipes/space-case.pipes';
import { FilterComponent } from '../filter/filter.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldType } from '../../interfaces/report-def';
import {By} from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DataFilter } from '../../classes/data-filter';
import { DateFilterComponent } from '../date-filter/date-filter.component';


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

describe('generic filter displayer', () => {
  let fixture: ComponentFixture<GenFilterDisplayerComponent>;
  let component: GenFilterDisplayerComponent;

  const clickFilter = (idx: number) => {
    const btn = fixture.debugElement.query(By.css('.filter-button')).nativeElement ;

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
      providers: [  ],
      imports: [ NoopAnimationsModule, MaterialModule, CommonModule, FormsModule ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(GenFilterDisplayerComponent);
    component = fixture.componentInstance;
    component.filterCols$ = getMetaData();
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
    (done: DoneFn) => {

      component.filters$.subscribe(
        () => done()
      );

      clickFilter(0);

      const filter = fixture.debugElement.queryAll(By.directive(FilterComponent))[0].componentInstance as FilterComponent;

      filter.info.filterValue = 'a';
      filter.info.filterType = 'Equals';
      filter.change$.emit();

      return;

  });

  it('should emit valid filter that filters data',
  (done: DoneFn) => {

    const fltr = new DataFilter( component.filters$.pipe(map( fltrs => fltrs.map(f => f.getFunc() ) )) ,  of([{
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
    ]));



    fltr.filteredData$.pipe(skip(2)).subscribe( d => {
        expect(d.length).toBe(1);
        done();
      });

    clickFilter(0);

    const filter = fixture.debugElement.queryAll(By.directive(FilterComponent))[0].componentInstance as FilterComponent;

    filter.info.filterValue = 'bob';
    filter.info.filterType = 'Equals';
    filter.change$.emit();

    return;
});

});
