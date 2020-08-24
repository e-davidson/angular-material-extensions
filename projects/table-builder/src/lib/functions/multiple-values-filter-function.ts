export function multipleValuesEqualsFunc(filterVal: string[], val: string): boolean {
  return filterVal.includes(val?.toLowerCase());
}


export function multipleValuesEqualsNumFunc(filterVal: string[], val: any): boolean{
 return filterVal.includes(String(val));
}

export function multipleValuesNotEqualsFunc(filterVal: string[], val: string): boolean {
  return !filterVal.includes(val?.toLowerCase());
}

export function multipleValuesNotEqualsNumFunc(filterVal: string[], val: any): boolean{
  return !filterVal.includes(String(val));
 }