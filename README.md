# Material Extensions - Table Builder

## Example Usage

Installation `npm i -s mx-table-builder`

Add to the imports section of NgModule:

```ts
@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
    TableBuilderModule.forRoot({
      defaultTableState: { pageSize: 20},
    })
  ],
  providers: [...]
})
export class AppModule { }
```

Simple Usage

```ts
@Component({
  selector: 'app-table-builder-example',
  template: `<tb-table-container [tableBuilder]='tableBuilder'></tb-table-container>`,
  styleUrls: ['./table-builder-example.component.css']
})
export class TableBuilderExampleComponent {
  public tableBuilder: TableBuilder;
  data$ = new BehaviorSubject<any[]>([
    {id: 17, name: 'Bob'},
    {id: 30, name: 'Charles'},
    {id: 55, name: 'Joan'},
  ]);
  metaData$ = new BehaviorSubject<MetaData[]>([
    {key: 'id', fieldType: FieldType.Number}, 
    {key: 'name', fieldType: FieldType.String },
  ]);
  constructor(private store: Store<any>) {
    this.tableBuilder = new TableBuilder(this.data$, this.metaData$);
  }
}
```

# Setting Column Meta Data

To configure how a column would be handle you configure it in the MetaData array that gets passed into the table builder.

The meta data has the following properties that can be set or configured.

| Option | Type | Description |
| ------ | ---- | ----------- |
| key | keyof row type | The name of the column. This is used to set what key in the object should be displayed in this column. |
| displayName | string | Set the display name if you don't want to use the object's key as the column header or any place you can see the column name displayed in the UI |
| fieldType | FieldType enum | The field type is used to configure how the column should be displayed. For example `FieldType.Date` will pass the field through angular's date pipe  |
| order | number | Order will set the default column position of this column. |
| additional | object | offers an additional set of options that can be configured for different field types see .... |
| preSort | SortDef | Set pre sort for default sorting |
| width | string | sets the defualt width in pixels |
| noExport | boolean | The column will not be exported when download to csv is clicked |
| noFilter | boolean | Set no filter to remove the filtering capability from the UI for this column. |
| transform | Function | Use Transform to change the default or customize the output for this column. |
| click | Function | Pass a callback to click that will run on click |
| template | TemplateRef | template allows you to pass a differnt template to over ride the default or customize the look of the column |


## Field Types

- Date: Will get displayed with date formating.
- Link: Will diplay as a link. Used with additional to configure the link destination.
- ImageUrl: displays the body as the src url for an image and displays the image.
- Currency: Format as currency.
- Array: Field has an array. Used with additional for options how to display the items.
- Hidden: The column will not be displayed in the table, filters and column selection.
- Number: display number.
- String: display string.
- Boolean: Display check or however it's configured.
- Phone number: will format as phone number.
- Expression: Uses the transform field to display.


## Additonal Options


| field | FieldType | description |
| ----- | - | ----------- |
| base | Link | base of the url |
| urlKey | Link | the key to use and append to the base of the url |
| target | Link | set the target type of the link. The available values are Blank, Self, Parent and Top. |
| useRouterLink | Link | sets the routerlink directive instead of href attribute | 
| export | any | additional export options |
| dateFormat | Date | sets date formating to using instead of the default |
| styles | any | sets css to apply to the column cells |
| columnPartStyles | any | sets css to apply to column part.

