import { createAction, props } from '@ngrx/store';
import { TableState } from '../classes/TableState';
import { FilterInfo } from '../classes/filter-info';
import { MetaData } from '../interfaces/report-def';

export const initTable = createAction( '[Table State] Init table', props<{tableId: string, tableState: Partial<TableState>}>());

export const setMetaData = createAction('[Table State] Set MetaData', props<{tableId: string, metaData: MetaData[]}>());

export const setHiddenColumn = createAction('[Table State] Set Hidden Column', props<{tableId: string, column: string}>());

export const setHiddenColumns = createAction('[Table State] Set Hidden Columns',
  props<{tableId: string, columns: {key: string, visible: boolean}[]}>());

export const updateTableState = createAction('[Table State] Update', props<{tableId: string, tableState: Partial<TableState>}>());

export const saveTableState = createAction('[Table State] Save', props<{tableId: string}>());

export const addFilter = createAction('[Table State] Add Filter', props<{tableId: string, filter: FilterInfo}>());

export const removeFilter = createAction('[Table State] Remove Filter', props<{tableId: string, filterId: string}>());

export const reset = createAction('[Table State] Reset', props<{tableId: string}>());
