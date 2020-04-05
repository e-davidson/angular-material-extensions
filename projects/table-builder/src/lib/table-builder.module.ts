
import { NgModule } from '@angular/core';
import { GenericTableComponent } from './components/generic-table/generic-table.component';
import { CustomCellDirective } from './directives/custom-cell-directive';
import { GenColDisplayerComponent } from './components/gen-col-displayer/gen-col-displayer.component';
import { GenFilterDisplayerComponent } from './components/gen-filter-displayer/gen-filter-displayer.component';
import { FilterComponent } from './components/filter/filter.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpaceCasePipe } from './pipes/space-case.pipes';
import { MaterialModule } from './material.module';
import { DateFilterComponent } from './components/date-filter/date-filter.component';
import { TableContainerComponent } from './components/table-container/table-container';
import { ColumnTotalPipe } from './pipes/column-total.pipe';
import { MultiSortDirective } from './directives/multi-sort.directive';
import { ColumnBuilderComponent } from './components/column-builder/column-builder.component';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { TableBuilderConfig, TableBuilderConfigToken } from './classes/TableBuilderConfig';
import { NumberFilterComponent } from './components/number-filter/number-filter.component';
import { StoreModule } from '@ngrx/store';
import { tableStateReducer } from './ngrx/reducer';
import { HeaderMenuComponent } from './components/header-menu/header-menu.component';
import { EffectsModule } from '@ngrx/effects';
import { SaveTableEffects } from './ngrx/effects';
import { KeyDisplayPipe } from './pipes/key-display';
import { FormatValuePipe } from './pipes/format-value';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    StoreModule.forFeature('fullTableState', tableStateReducer),
    EffectsModule.forFeature([SaveTableEffects]),
    FormsModule,
    RouterModule,
  ],
    exports: [
        GenericTableComponent,
        TableContainerComponent,
        CustomCellDirective,
        GenColDisplayerComponent,
        GenFilterDisplayerComponent,
        FilterComponent,
        MultiSortDirective
    ],
    declarations: [
        SpaceCasePipe,
        ColumnTotalPipe,
        TableContainerComponent,
        GenericTableComponent,
        CustomCellDirective,
        GenColDisplayerComponent,
        GenFilterDisplayerComponent,
        DateFilterComponent,
        FilterComponent,
        MultiSortDirective,
        NumberFilterComponent,
        ColumnBuilderComponent,
        HeaderMenuComponent,
        KeyDisplayPipe,
        FormatValuePipe,
    ],
    providers : [SpaceCasePipe, DatePipe]
})
export class TableBuilderModule {
  static forRoot(config: TableBuilderConfig): ModuleWithProviders {
    return {
      ngModule: TableBuilderModule,
      providers: [
        MultiSortDirective,
        { provide : TableBuilderConfigToken , useValue: config}
      ]
    };
  }
}
