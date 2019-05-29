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
}

export const NumberFilterMap = {
    [FilterType.NumberEquals]: [FilterType.NumberEquals],
    [FilterType.NumberGreaterThen]: [FilterType.NumberGreaterThen],
    [FilterType.NumberLessThen]: [FilterType.NumberLessThen],
    [FilterType.NumberBetween]: [FilterType.NumberBetween],
};

export const StringFilterMap = {
    [FilterType.StringEquals]: [FilterType.StringEquals],
    [FilterType.StringContains]: [FilterType.StringContains],
    [FilterType.StringStartWith]: [FilterType.StringStartWith],
    [FilterType.StringEndsWith]: [FilterType.StringEndsWith],
};

export const DateFilterMap = {
    [FilterType.DateIsOn]: [FilterType.DateIsOn],
    [FilterType.DateOnOrAfter]: [FilterType.DateOnOrAfter],
    [FilterType.DateOnOrBefore]: [FilterType.DateOnOrBefore],
    [FilterType.DateBetween]: [FilterType.DateBetween],
};

export const BooleanFilterMap = {
    [FilterType.BooleanEquals]: [FilterType.BooleanEquals]
};
