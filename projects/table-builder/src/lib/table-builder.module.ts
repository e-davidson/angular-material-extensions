
import { NgModule } from '@angular/core';
import { GenericTableComponent } from './components/generic-table/generic-table.component';
import { CustomCellDirective } from './directives/custom-cell-directive';
import { GenColDisplayerComponent } from './components/gen-col-displayer/gen-col-displayer.component';
import { GenFilterDisplayerComponent } from './components/gen-filter-displayer/gen-filter-displayer.component';
import { FilterComponent } from './components/filter/filter.component';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
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
import { storageStateReducer } from './ngrx/reducer';
import { HeaderMenuComponent } from './components/header-menu/header-menu.component';
import { EffectsModule } from '@ngrx/effects';
import { SaveTableEffects } from './ngrx/effects';
import { KeyDisplayPipe } from './pipes/key-display';
import { PhoneNumberPipe } from './pipes/phone.pipe';
import { FunctionPipe } from './pipes/function.pipe';
import { RouterModule } from '@angular/router';
import { StopPropagationDirective } from './directives/stop-propagation.directive';
import { ArrayColumnComponent } from './components/array-column.component';
import { StylerDirective } from './directives/styler';
import { PreventEnterDirective } from './directives/prevent-enter.directive';
import { InFilterComponent } from './components/in-filter/in-filter.component';
import {AutoFocusDirective} from './directives/auto-focus.directive'
import { FormatFilterValuePipe } from './pipes/format-filter-value.pipe';
import { FormatFilterTypePipe } from './pipes/format-filter-type.pipe';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    StoreModule.forFeature('storageState', storageStateReducer),
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
        MultiSortDirective,
        StopPropagationDirective,
        PreventEnterDirective,
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
        ArrayColumnComponent,
        HeaderMenuComponent,
        KeyDisplayPipe,
        PhoneNumberPipe,
        FunctionPipe,
        FormatFilterValuePipe,
        FormatFilterTypePipe,
        StopPropagationDirective,
        StylerDirective,
        PreventEnterDirective,
        InFilterComponent,
        AutoFocusDirective,
    ],
    providers : [SpaceCasePipe, DatePipe, CurrencyPipe, PhoneNumberPipe]
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
