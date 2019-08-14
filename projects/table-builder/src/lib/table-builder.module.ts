
import { NgModule } from '@angular/core';
import { GenericTableComponent } from './components/generic-table/generic-table.component';
import { CustomCellDirective } from './directives/custom-cell-directive';
import { GenColDisplayerComponent } from './components/gen-col-displayer/gen-col-displayer.component';
import { GenValDisplayerComponent } from './components/gen-val-displayer/gen-val-displayer.component';
import { GenFilterDisplayerComponent } from './components/gen-filter-displayer/gen-filter-displayer.component';
import { FilterComponent } from './components/filter/filter.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpaceCasePipe } from './pipes/space-case.pipes';
import { MaterialModule } from './material.module';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { TableContainerComponent } from './components/table-container/table-container';
import { ColumnTotalPipe } from './pipes/column-total.pipe';
import { MultiSortDirective } from './directives/multi-sort.directive';
import { ColumnBuilderComponent } from './components/column-builder/column-builder.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
  ],
    exports: [
        GenericTableComponent,
        TableContainerComponent,
        CustomCellDirective,
        GenColDisplayerComponent,
        GenValDisplayerComponent,
        GenFilterDisplayerComponent,
        FilterComponent,
        MultiSortDirective
    ],
    declarations: [
        ColumnBuilderComponent,
        SpaceCasePipe,
        ColumnTotalPipe,
        TableContainerComponent,
        GenericTableComponent,
        CustomCellDirective,
        GenColDisplayerComponent,
        GenValDisplayerComponent,
        GenFilterDisplayerComponent,
        DateFilterComponent,
        FilterComponent,
        MultiSortDirective
    ],
    providers: [
      MultiSortDirective
    ]
})
export class TableBuilderModule { }
