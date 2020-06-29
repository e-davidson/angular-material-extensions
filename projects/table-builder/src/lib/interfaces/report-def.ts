
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

export interface MetaData {
    key: string;
    displayName?: string;
    fieldType: FieldType;
    additional?: Additional;
    order?: number;
    preSort?: PreSortDef;
    _internalNotUserDefined?: boolean;
    width?: string;
    noExport?: boolean;
    noFilter?: boolean;
}

export interface  ReportDef<DataType = any> {
    data: DataType[];
    metaData: MetaData [];
    totalRecords?: number;
    count: number;
}

export interface PreSortDef {
    direction: SortDirection;
    precedence?: number;
}

export interface Additional   {
  base?: string;
  urlKey?: string;
  target?: Target;
  footer?: { type: string };
  useRouterLink?: boolean;
  export?: any;
  dateFormat?: string;
}
