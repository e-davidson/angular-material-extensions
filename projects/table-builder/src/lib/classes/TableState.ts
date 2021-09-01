import { FilterInfo } from './filter-info';
import { Dictionary } from '../interfaces/dictionary';
import { Sort } from '@angular/material/sort';
import { MetaData } from '../..';
import { GeneralTableSettings, NotPersisitedTableSettings, PesrsistedTableSettings } from './table-builder-general-settings';

export interface SavedTableProfile {
  profileNames : string [];
  currentProfile: string;
  profiles: Dictionary<PersistedTableState>;
}

export interface PersistedTableState {
  hiddenKeys?: string [];
  pageSize?: number;
  currentPage?: number;
  filters: Dictionary<FilterInfo>;
  initialized : boolean;
  sorted : Sort [];
  currentProfile?: string;
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
  initialized : false,
  sorted: [],
  userDefined:{order:{},widths:{},table:{}},
  persistedTableSettings : new PesrsistedTableSettings(),
  notPersisitedTableSettings : new NotPersisitedTableSettings(),
};
