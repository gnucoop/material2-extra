# md-calendar

`md-calendar` is a simple calendar widget that allows users to
select pick single date or date ranges (weeks, months, years)


## Notes

The `md-calendar` component fully support two-way binding of
`ngModel`


## Usage

### Basic Usage

```html
<md-calendar (change)="onPeriodChange($event)"></md-calendar>
```


### Usage within Forms

`md-calendar` supports `[(ngModel)]` and `ngControl` for use within
forms.

```html
<form (submit)="onSubmit()">
  <!-- other fields -->
  <div>
    <md-calendar [(ngModel)]="datePeriod"></md-calendar>
  </div>
</form>
```


### API Summary

Properties:

| Name | Type | Description |
| --- | --- | --- |
| `selection-mode` | `"day"|"week"|"month"|"year"` | The range of dates selected when user clicks on a date
| `disabled` | boolean | Whether or not the button is disabled