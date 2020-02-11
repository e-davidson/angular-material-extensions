export enum FilterType {
    NumberEquals = 'Equals',
    NumberGreaterThen = 'Greater Then',
    NumberLessThen = 'Less Then',
    NumberBetween = 'Between',
    StringEquals = 'Equals',
    StringContains = 'Contains',
    StringStartWith = 'Start With',
    StringEndsWith = 'Ends With',
    DateIsOn = 'Is on',
    DateOnOrAfter = 'On or After',
    DateOnOrBefore = 'On or Before',
    DateBetween = 'Between',
    BooleanEquals = 'Is',
    IsNull = 'Is Blank',
}

export const NumberFilterMap = {
    [FilterType.NumberEquals]: [FilterType.NumberEquals],
    [FilterType.NumberGreaterThen]: [FilterType.NumberGreaterThen],
    [FilterType.NumberLessThen]: [FilterType.NumberLessThen],
    [FilterType.NumberBetween]: [FilterType.NumberBetween],
    [FilterType.IsNull]: [FilterType.IsNull],
};

export const StringFilterMap = {
    [FilterType.StringEquals]: [FilterType.StringEquals],
    [FilterType.StringContains]: [FilterType.StringContains],
    [FilterType.StringStartWith]: [FilterType.StringStartWith],
    [FilterType.StringEndsWith]: [FilterType.StringEndsWith],
    [FilterType.IsNull]: [FilterType.IsNull],
};

export const DateFilterMap = {
    [FilterType.DateIsOn]: [FilterType.DateIsOn],
    [FilterType.DateOnOrAfter]: [FilterType.DateOnOrAfter],
    [FilterType.DateOnOrBefore]: [FilterType.DateOnOrBefore],
    [FilterType.DateBetween]: [FilterType.DateBetween],
    [FilterType.IsNull]: [FilterType.IsNull],
};

export const BooleanFilterMap = {
    [FilterType.BooleanEquals]: [FilterType.BooleanEquals],
    [FilterType.IsNull]: [FilterType.IsNull],
};
