import { Component } from '@angular/core';
import { TableBuilder } from '../lib/classes/table-builder';
import { of } from 'rxjs';
import { FieldType } from '../lib/interfaces/report-def';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TableContainerComponent } from '../lib/components/table-container/table-container';
import { provideMockStore } from '@ngrx/store/testing';
import { TableBuilderConfigToken } from '../lib/classes/TableBuilderConfig';
import { DatePipe } from '@angular/common';
import { MaterialModule } from '../lib/material.module';
import { ColumnBuilderComponent } from '../lib/components/column-builder/column-builder.component';
import { GenericTableComponent } from '../lib/components/generic-table/generic-table.component';
import { GenFilterDisplayerComponent } from '../lib/components/gen-filter-displayer/gen-filter-displayer.component';
import { GenColDisplayerComponent } from '../lib/components/gen-col-displayer/gen-col-displayer.component';
import { MultiSortDirective, CustomCellDirective } from '../lib/directives';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SpaceCasePipe } from '../lib/pipes/space-case.pipes';
import { HeaderMenuComponent } from '../lib/components/header-menu/header-menu.component';
import { FormsModule } from '@angular/forms';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTableHarness } from '@angular/material/table/testing';

@Component({
  template: `
    <tb-table-container [tableBuilder]='tableBuilder' tableId='test-id' >
      <ng-container customCell='name' matColumnDef='name' >
        <mat-footer-cell *matFooterCellDef >
            Hello
        </mat-footer-cell>
      </ng-container>
    </tb-table-container>
  `,
})
class TableWithCustomerFooter {
  tableBuilder: TableBuilder = new TableBuilder(
    of([{ name: 'joe' }]),
    of([{ key: 'name', fieldType: FieldType.String }])
  );
}

const initialState = {
  fullTableState: {
    'test-id': {
      metaData: [{ key: 'name', fieldType: FieldType.String }],
      hiddenKeys: [],
      pageSize: 10,
      initialized: true,
      filters: [],
    }
  }
};

describe('LetDirective', () => {
  let component: TableWithCustomerFooter;
  let fixture: ComponentFixture<TableWithCustomerFooter>;
  let loader: HarnessLoader;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TableWithCustomerFooter,
        TableContainerComponent,
        ColumnBuilderComponent,
        GenericTableComponent,
        GenFilterDisplayerComponent,
        GenColDisplayerComponent,
        MultiSortDirective,
        SpaceCasePipe,
        HeaderMenuComponent,
        CustomCellDirective,
      ],
      providers: [
        { provide: TableBuilderConfigToken, useValue: { defaultTableState: {} } },
        provideMockStore({ initialState }),
        DatePipe,
        MultiSortDirective,
      ],
      imports: [MaterialModule, NoopAnimationsModule, FormsModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableWithCustomerFooter);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('should create', async () => {
    const harness = await loader.getHarness(MatTableHarness);
    const rows = await harness.getRows();
    expect(rows.length).toBe(1);
    const cells = await rows[0].getCells();
    expect(cells.length).toBe(1);
    const text = await cells[0].getText();
    expect(text).toBe('joe');
    const footerRows = await harness.getFooterRows();
    expect(footerRows.length).toBe(1);
    const footerCells = await footerRows[0].getCells();
    const footerText = await footerCells[0].getText();
    expect(footerText).toBe('Hello');
    expect(component).toBeTruthy();
  });

  it('should be instantiable', () => {

  });
});
