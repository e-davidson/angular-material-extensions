export function isNull(filterVal: boolean, val: null){
  return filterVal ? val == null : val != null;
}