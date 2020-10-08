import { FilterFunc } from '../classes/filter-info';

export enum FilterType {
    NumberEquals = 'Equals',
    NumberNotEqual = 'Does Not Equal',
    NumberGreaterThen = 'Greater Then',
    NumberLessThen = 'Less Then',
    NumberBetween = 'Between',
    StringEquals = 'Equals',
    StringContains = 'Contains',
    StringDoesNotContain = 'Does Not Contain',
    StringStartWith = 'Start With',
    StringEndsWith = 'Ends With',
    DateIsOn = 'Is on',
    DateIsNotOn = 'Is Not On',
    DateOnOrAfter = 'On or After',
    DateOnOrBefore = 'On or Before',
    DateBetween = 'Between',
    BooleanEquals = 'Is',
    IsNull = 'Is Blank',
    NumberIn = 'In',
    StringIn = 'Is In',
    Or = 'Or',
    And = 'And',
}

export const NumberFilterMap:FilterToFiltersMap = {
    [FilterType.NumberEquals]: [FilterType.NumberEquals],
    [FilterType.NumberNotEqual]: [FilterType.NumberNotEqual],
    [FilterType.NumberGreaterThen]: [FilterType.NumberGreaterThen],
    [FilterType.NumberLessThen]: [FilterType.NumberLessThen],
    [FilterType.NumberBetween]: [FilterType.NumberBetween],
    [FilterType.IsNull]: [FilterType.IsNull],
    [FilterType.NumberIn]: [FilterType.NumberIn],
};

export const StringFilterMap:FilterToFiltersMap = {
    [FilterType.StringEquals]: [FilterType.StringEquals],
    [FilterType.StringContains]: [FilterType.StringContains],
    [FilterType.StringDoesNotContain]: [FilterType.StringDoesNotContain],
    [FilterType.StringStartWith]: [FilterType.StringStartWith],
    [FilterType.StringEndsWith]: [FilterType.StringEndsWith],
    [FilterType.IsNull]: [FilterType.IsNull],
    [FilterType.StringIn]: [FilterType.StringIn],
};

export const DateFilterMap:FilterToFiltersMap = {
    [FilterType.DateIsOn]: [FilterType.DateIsOn],
    [FilterType.DateIsNotOn]: [FilterType.DateIsNotOn],
    [FilterType.DateOnOrAfter]: [FilterType.DateOnOrAfter],
    [FilterType.DateOnOrBefore]: [FilterType.DateOnOrBefore],
    [FilterType.DateBetween]: [FilterType.DateBetween],
    [FilterType.IsNull]: [FilterType.IsNull],
};

export const BooleanFilterMap :FilterToFiltersMap = {
    [FilterType.BooleanEquals]: [FilterType.BooleanEquals],
    [FilterType.IsNull]: [FilterType.IsNull],
};

export type FilterToFiltersMap = Partial<{[key in FilterType]: FilterType[]}>;
