import { InjectionToken } from '@angular/core';
import { TableState } from './TableState';

export interface TableBuilderConfig {
  defaultTableState: Partial<TableState>;
  export?: TableBuilderExport
}

export interface TableBuilderExport {
  dateFormat?: string;
  onSave?: (event?: any) => void;
}

export const TableBuilderConfigToken = new InjectionToken<TableBuilderConfig>('TableBuilderConfig');
