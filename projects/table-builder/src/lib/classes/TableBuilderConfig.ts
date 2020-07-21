import { InjectionToken } from '@angular/core';
import { TableState } from './TableState';
import { DefaultSettings } from './DefaultSettings';
import { ArrayAdditional } from '../interfaces/report-def';
export interface TableBuilderConfig {
  defaultTableState: Partial<TableState>;
  export?: TableBuilderExport
  defaultSettings?: DefaultSettings;
  arrayInfo?: ArrayAdditional
}

export interface TableBuilderExport {
  dateFormat?: string;
  onSave?: (event?: any) => void;
}

export const TableBuilderConfigToken = new InjectionToken<TableBuilderConfig>('TableBuilderConfig');
