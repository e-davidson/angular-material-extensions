import { Dictionary } from './dictionary';
import { PipeTransform, TemplateRef } from '@angular/core';

export enum FieldType {
    Unknown = 0,
    Date = 1,
    Link = 2,
    ImageUrl = 3,
    Currency = 4,
    Array = 5,
    Hidden = 6,
    Number = 7,
    String = 8,
    Boolean = 9,
    PhoneNumber = 10,
    Expression = 11,
    Enum = 12,
}

export enum SortDirection {
    asc= 'asc',
    desc= 'desc'
}

export enum Target {
  Blank = '_blank',
  Self = '_self',
  Parent = '_parent',
  Top = '_top'
}

export interface MetaData<T = any> {
    key: keyof T & string;
    displayName?: string;
    fieldType: FieldType;
    additional?: Additional;
    order?: number;
    preSort?: SortDef;
    _internalNotUserDefined?: boolean;
    width?: string;
    noExport?: boolean;
    noFilter?: boolean;
    customCell?: boolean;
    transform?: ( (o: T | string, ...args: any[])=> any ) | PipeTransform;
    click?: (element: T, key: string ) => void;
    template?: TemplateRef<any>;
}

export interface  ReportDef<DataType = any> {
    data: DataType[];
    metaData: MetaData [];
    totalRecords?: number;
    count: number;
}

export interface SortDef {
    direction: SortDirection;
    precedence?: number;
}

export interface FilterOptions {
  filterableValues : string[]
}

export interface Additional   {
  base?: string;
  urlKey?: string;
  target?: Target;
  footer?: { type: string };
  useRouterLink?: boolean;
  export?: any;
  dateFormat?: string;
  filterOptions?: FilterOptions;
  styles?: Dictionary<string>;
  columnPartStyles?: {
    header?: Dictionary<string>,
    body?: Dictionary<string>,
    footer?: Dictionary<string>,
  }
  enumMap?: {[key:number]:string};
}

export enum ArrayStyle {
  CommaDelimited,
  NewLine
}

export interface ArrayAdditional extends Additional {
    metaData?: MetaData;
    limit?: number;
    arrayStyle?: ArrayStyle;
}
