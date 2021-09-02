import { FilterInfo } from './filter-info';
import { Dictionary } from '../interfaces/dictionary';
import { Sort } from '@angular/material/sort';
import { MetaData } from '../..';
import { NotPersisitedTableSettings, PesrsistedTableSettings } from './table-builder-general-settings';

export interface PersistedTableState {
  hiddenKeys?: string [];
  pageSize?: number;
  filters: Dictionary<FilterInfo>;
  sorted : Sort [];
  userDefined : {order:Dictionary<number>,widths:Dictionary<number>,table:{width?:number}};
  persistedTableSettings : PesrsistedTableSettings;
}

export interface TableState extends PersistedTableState {
  metaData?: Dictionary<MetaData>;
  notPersisitedTableSettings : NotPersisitedTableSettings;
}

export const defaultTableState: TableState = {
  metaData: {},
  filters: {},
  hiddenKeys: [],
  sorted: [],
  userDefined:{order:{},widths:{},table:{}},
  persistedTableSettings : new PesrsistedTableSettings(),
  notPersisitedTableSettings : new NotPersisitedTableSettings(),
};
