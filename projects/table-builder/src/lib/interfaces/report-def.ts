
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
}

export enum SortDirection{
    asc='asc',
    desc='desc'
}

export interface MetaData {
    key: string;
    displayName?: string;
    fieldType: FieldType;
    additional?: any;
    order?: number;
    preSort?: PreSortDef
}

export interface  ReportDef {
    data: any[];
    metaData: MetaData [];
    totalRecords?: number;
    count: number;
}

export interface PreSortDef {
    direction: SortDirection;
    precedence?: number
}
