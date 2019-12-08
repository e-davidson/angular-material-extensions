import { MetaData } from '../interfaces/report-def';
import { FilterInfo } from './filter-info';
import { Dictionary } from '../interfaces/dictionary';

export interface TableState {
  metaData?: MetaData [];
  data?: any [];
  hiddenKeys?: string [];
  pageSize?: number;
  currentPage?: number;
  filters: Dictionary<FilterInfo>;
}
