
import { NgModule } from '@angular/core';
import { GenericTableComponent } from './components/generic-table/generic-table.component';
import { CustomCellDirective } from './directives/custom-cell-directive';
import { GenColDisplayerComponent } from './components/gen-col-displayer/gen-col-displayer.component';
import { GenFilterDisplayerComponent } from './components/table-container-filter/gen-filter-displayer/gen-filter-displayer.component';
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
import { ModuleWithProviders } from '@angular/core';
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
import { DialogOpenDirective } from './directives/buttonSubject';
import { DialogDirective } from './directives/dialog';
import { ResizeColumnDirective } from './directives/resize-column.directive';
import {ReactiveComponentModule} from '@ngrx/component'
import { DragDropModule } from '@angular/cdk/drag-drop';
import { InitializationComponent } from './components/initialization-component/initialization-component';
import { TableTemplateService } from './services/table-template-service';
import { InListFilterComponent } from './components/filter/in-list/in-list-filter.component';
import { SortMenuComponent } from './components/sort-menu/sort-menu.component';
import { FilterChipsComponent } from './components/table-container-filter/filter-list/filter-list.component';
import { PaginatorComponent } from './components/generic-table/paginator.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    StoreModule.forFeature('globalStorageState', storageStateReducer),
    EffectsModule.forFeature([SaveTableEffects]),
    FormsModule,
    RouterModule,
    ReactiveComponentModule,
    DragDropModule
  ],
    exports: [
        GenericTableComponent,
        PaginatorComponent,
        TableContainerComponent,
        CustomCellDirective,
        GenColDisplayerComponent,
        GenFilterDisplayerComponent,
        FilterComponent,
        MultiSortDirective,
        StopPropagationDirective,
        PreventEnterDirective,
        StylerDirective,
        ResizeColumnDirective,
    ],
    declarations: [
        SpaceCasePipe,
        ColumnTotalPipe,
        TableContainerComponent,
        GenericTableComponent,
        PaginatorComponent,
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
        ResizeColumnDirective,
        InFilterComponent,
        AutoFocusDirective,
        DialogOpenDirective,
        DialogDirective,
        InitializationComponent,
        InListFilterComponent,
        SortMenuComponent,
        FilterChipsComponent,
    ],
    providers : [
      SpaceCasePipe,
      DatePipe,
      CurrencyPipe,
      PhoneNumberPipe,
      TableTemplateService,
    ]
})
export class TableBuilderModule {
  static forRoot(config: TableBuilderConfig): ModuleWithProviders<TableBuilderModule> {
    return {
      ngModule: TableBuilderModule,
      providers: [
        MultiSortDirective,
        { provide : TableBuilderConfigToken , useValue: config}
      ]
    };
  }
}
