import { InjectionToken } from '@angular/core';
import { TableState } from './TableState';
import { DefaultSettings } from './DefaultSettings';

export interface TableBuilderConfig {
  defaultTableState: Partial<TableState>;
  export?: TableBuilderExport
  defaultSettings?: DefaultSettings;
}

export interface TableBuilderExport {
  dateFormat?: string;
  onSave?: (event?: any) => void;
}

export const TableBuilderConfigToken = new InjectionToken<TableBuilderConfig>('TableBuilderConfig');
