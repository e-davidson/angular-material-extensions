export function isNull(filterVal: boolean, val: any){
  return filterVal ? val == null || val === '' : val != null && val !== '';
}