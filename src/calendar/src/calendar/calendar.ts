import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Observable } from 'rxjs/Observable';

import * as moment from 'moment';
const momentConstructor: (value?: any) => moment.Moment = (<any>moment).default || moment;


export const MD_CALENDAR_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MdeCalendar),
  multi: true
};

const weekDays: string[] = [
  '', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export type MdeCalendarViewMode = ('month' | 'year' | 'decade');
export type MdeCalendarPeriodType = ('day' | 'week' | 'month' | 'year');
export type MdeCalendarEntryType = ('day' | 'month' | 'year');
export type MdeCalendarWeekDay = (
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
);
export type MdeCalendarEntrySelectedState = ('none' | 'partial' | 'full');

export class MdeCalendarPeriod {
  type: MdeCalendarPeriodType;
  startDate: Date;
  endDate: Date;
}

export class MdeCalendarChange {
  source: MdeCalendar;
  period: MdeCalendarPeriod | null;
}

export class MdeCalendarEntry {
  type: MdeCalendarEntryType;
  date: Date;
  selected: MdeCalendarEntrySelectedState;

  constructor(params: {
    type: MdeCalendarEntryType,
    date: Date,
    selected: MdeCalendarEntrySelectedState
  }) {
    this.type = params.type;
    this.date = params.date;
    this.selected = params.selected;
  }

  toString(): string {
    if (this.type == 'day') {
      return `${this.date.getDate()}`;
    }
    if (this.type == 'month') {
      return momentConstructor(this.date).format('MMM');
    }
    return `${this.date.getFullYear()}`;
  }

  getRange(): {start: moment.Moment, end: moment.Moment} {
    if (this.type == 'day') {
      let day: moment.Moment = momentConstructor(this.date);
      return {start: day, end: day};
    } else {
      let curMoment: moment.Moment = momentConstructor(this.date);
      return {
        start: curMoment.clone().startOf(this.type),
        end: curMoment.clone().endOf(this.type)
      };
    }
  }
}

@Component({
  moduleId: module.id,
  selector: 'mde-calendar',
  templateUrl: 'calendar.html',
  styleUrls: ['calendar.css'],
  providers: [MD_CALENDAR_CONTROL_VALUE_ACCESSOR]
})
export class MdeCalendar implements ControlValueAccessor {
  private _viewDate: Date = new Date();
  private _viewMoment: moment.Moment = momentConstructor();
  private _viewHeader: string = '';

  private _onChangeCallback: (_: any) => void = (_: any) => {};
  private _onTouchedCallback: () => void = () => {};

  get viewDate(): Date { return this._viewDate; }
  @Input('view-date')
  set viewDate(viewDate: Date) { this._setViewDate(viewDate); }

  private _viewMode: MdeCalendarViewMode = 'month';

  get viewMode(): MdeCalendarViewMode { return this._viewMode; }
  @Input('view-mode')
  set viewMode(viewMode: MdeCalendarViewMode) {
    this._viewMode = viewMode;
    this._buildCalendar();
  }

  private _selectionMode: MdeCalendarPeriodType = 'day';

  get selectionMode(): MdeCalendarPeriodType { return this._selectionMode; }
  @Input('selection-mode')
  set selectionMode(selectionMode: MdeCalendarPeriodType) {
    this._selectionMode = selectionMode;
  }

  private _startOfWeekDay: number = 1;

  get startOfWeekDay(): MdeCalendarWeekDay {
    return <MdeCalendarWeekDay>weekDays[this._startOfWeekDay];
  }
  @Input('start-of-week-day')
  set startOfWeekDay(weekDay: MdeCalendarWeekDay) {
    this._startOfWeekDay = weekDays.indexOf(weekDay);

    (<any>moment).updateLocale(moment.locale(), { week: { dow: this._startOfWeekDay }});

    if (this._viewMode == 'month') {
      this._buildCalendar();
    }
  }

  private _isoMode: Boolean = false;

  get isoMode(): Boolean {
    return this._isoMode;
  }
  @Input('iso-mode')
  set isoMode(isoMode: Boolean) {
    this._isoMode = isoMode;
  }

  private _change: EventEmitter<MdeCalendarChange> = new EventEmitter<MdeCalendarChange>();
  @Output() change(): Observable<MdeCalendarChange> { return this._change.asObservable(); }

  private _selectedPeriod: MdeCalendarPeriod | null;
  private set selectedPeriod(period: MdeCalendarPeriod | null) {
    this._selectedPeriod = period;
    this._change.emit({
      source: this,
      period: period
    });
    this._refreshSelection();
  }

  get value(): MdeCalendarPeriod | null { return this._selectedPeriod; }
  set value(period: MdeCalendarPeriod | null) {
    if (period !== this._selectedPeriod) {
      this.selectedPeriod = period;
      this._onChangeCallback(period);
    }
  }

  get calendarRows(): MdeCalendarEntry[][] { return this._calendarRows; }
  get viewHeader(): string { return this._viewHeader; }
  get weekDays(): string[] { return this._weekDays; }

  private _calendarRows: MdeCalendarEntry[][] = [];
  private _weekDays: string[] = [];

  constructor() {
    this._buildCalendar();
  }

  prevPage(): void {
    if (this._viewMode == 'month') {
      this.viewDate = momentConstructor(this.viewDate).subtract(1, 'M').toDate();
    } else if (this._viewMode == 'year') {
      this.viewDate = momentConstructor(this.viewDate).subtract(1, 'y').toDate();
    }
    this._buildCalendar();
  }

  nextPage(): void {
    if (this._viewMode == 'month') {
      this.viewDate = momentConstructor(this.viewDate).add(1, 'M').toDate();
    } else if (this._viewMode == 'year') {
      this.viewDate = momentConstructor(this.viewDate).add(1, 'y').toDate();
    }
    this._buildCalendar();
  }

  previousViewMode(): void {
    if (this._viewMode == 'decade') {
      return;
    } else if (this._viewMode == 'year') {
      this._viewMode = 'decade';
    } else if (this._viewMode == 'month') {
      this._viewMode = 'year';
    }
    this._buildCalendar();
  }

  selectEntry(entry: MdeCalendarEntry): void {
    if (!this._canSelectEntry(entry)) {
      return this._nextViewMode(entry);
    }

    let newPeriod: MdeCalendarPeriod | null = null;
    if (this._isEntrySelected(entry) == 'full') {
      newPeriod = null;
    } else if (this._selectionMode == 'day') {
      newPeriod = {
        type: 'day',
        startDate: entry.date,
        endDate: entry.date
      };
    } else if (this._selectionMode == 'week') {
      newPeriod = {
        type: 'week',
        startDate: new Date(momentConstructor(entry.date).startOf('week').toDate().valueOf()),
        endDate: new Date(momentConstructor(entry.date).endOf('week').toDate().valueOf())
      };
    } else if (this._selectionMode == 'month') {
      newPeriod = {
        type: 'month',
        startDate: new Date(momentConstructor(entry.date).startOf('month').toDate().valueOf()),
        endDate: new Date(momentConstructor(entry.date).endOf('month').toDate().valueOf())
      };
    } else if (this._selectionMode == 'year') {
      newPeriod = {
        type: 'year',
        startDate: new Date(momentConstructor(entry.date).startOf('year').toDate().valueOf()),
        endDate: new Date(momentConstructor(entry.date).endOf('year').toDate().valueOf())
      };
    }
    this.value = newPeriod;
  }

  registerOnChange(fn: (value: any) => void) {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this._onTouchedCallback = fn;
  }

  writeValue(value: any) {
    this.selectedPeriod = value;
  }

  private _getMonthName(date: Date): string {
    return momentConstructor(date).format('MMM');
  }

  private _setViewDate(date: Date): void {
    this._viewDate = date;
    this._viewMoment = momentConstructor(date);
  }

  private _buildCalendar(): void {
    if (this._viewMode == 'month') {
      this._buildMonthView();
    } else if (this._viewMode == 'year') {
      this._buildYearView();
    } else if (this._viewMode == 'decade') {
      this._buildDecadeView();
    }
  }

  private _buildDecadeView(): void {
    let curYear: number = this._viewDate.getFullYear();
    let firstYear = curYear - (curYear % 10) + 1;
    let lastYear = firstYear + 11;

    this._viewHeader = `${firstYear} - ${lastYear}`;

    let curDate: moment.Moment = momentConstructor(this.viewDate)
      .startOf('year')
      .year(firstYear);

    let rows: MdeCalendarEntry[][] = [];
    for (let i = 0 ; i < 4 ; i ++) {
      let row: MdeCalendarEntry[] = [];
      for (let j = 0 ; j < 3 ; j ++) {
        let date = new Date(curDate.toDate().valueOf());
        let newEntry = new MdeCalendarEntry({
          type: 'year',
          date: date,
          selected: 'none'
        });
        newEntry.selected = this._isEntrySelected(newEntry);
        row.push(newEntry);
        curDate.add(1, 'y');
      }
      rows.push(row);
    }
    this._calendarRows = rows;
  }

  private _buildYearView(): void {
    this._viewHeader = `${this._viewDate.getFullYear()}`;

    let curDate: moment.Moment = momentConstructor(this.viewDate)
      .startOf('year');

    let rows: MdeCalendarEntry[][] = [];
    for (let i = 0 ; i < 4 ; i ++) {
      let row: MdeCalendarEntry[] = [];
      for (let j = 0 ; j < 3 ; j ++) {
        let date = new Date(curDate.toDate().valueOf());
        let newEntry = new MdeCalendarEntry({
          type: 'month',
          date: date,
          selected: 'none'
        });
        newEntry.selected = this._isEntrySelected(newEntry);
        row.push(newEntry);
        curDate.add(1, 'M');
      }
      rows.push(row);
    }
    this._calendarRows = rows;
  }

  private _buildMonthView(): void {
    this._viewHeader = momentConstructor(this._viewDate).format('MMM YYYY');

    this._buildMonthViewWeekDays();
    let viewStartDate: moment.Moment;
    let viewEndDate: moment.Moment;

    if (this._isoMode) {
      let momentDate = momentConstructor(this.viewDate);
      let originalMonth = momentDate.month();
      let startMonthCounter = 0;
      let endMonthCounter = 0;

      for (let i = 0; i < 8; i++) {
        if (momentDate.startOf('month').isoWeekday(i).month() < originalMonth) {
          startMonthCounter++;
        }
        if (momentDate.endOf('month').isoWeekday(i).month() > originalMonth) {
          endMonthCounter++;
        }
      }
      if (startMonthCounter > 3) {
        viewStartDate = momentDate.startOf('month').isoWeekday(1).add('d', 7);
      } else {
        viewStartDate = momentDate.startOf('month').isoWeekday(1);
      }
      if (endMonthCounter > 3) {
        viewEndDate = momentDate.endOf('month').isoWeek(7).subtract('d', 7);
      } else {
        viewEndDate = momentDate.endOf('month').isoWeek(7);
      }

    } else {
      viewStartDate = momentConstructor(this.viewDate)
        .startOf('month')
        .startOf('week');
      viewEndDate = momentConstructor(this.viewDate)
        .endOf('month')
        .endOf('week');
    }

    let rows: MdeCalendarEntry[][] = [];
    let curDate = momentConstructor(viewStartDate);
    while (curDate < viewEndDate) {
      let row: MdeCalendarEntry[] = [];
      for (let i = 0 ; i < 7 ; i++) {
        let date = new Date(curDate.toDate().valueOf());
        let newEntry: MdeCalendarEntry = new MdeCalendarEntry({
          type: 'day',
          date: date,
          selected: 'none'
        });
        newEntry.selected = this._isEntrySelected(newEntry);
        row.push(newEntry);
        curDate.add(1, 'd');
      }
      rows.push(row);
    }

    this._calendarRows = rows;
  }

  private _buildMonthViewWeekDays(): void {
    let curMoment = momentConstructor().startOf('week').isoWeekday(1);
    let weekDayNames: string[] = [];
    for (let i = 0 ; i < 7 ; i++) {
      weekDayNames.push(curMoment.format('dddd'));
      curMoment.add(1, 'd');
    }
    this._weekDays = weekDayNames;
  }

  private _periodOrder(entryType: MdeCalendarPeriodType): number {
    return ['day', 'week', 'month', 'year'].indexOf(entryType);
  }

  private _isEntrySelected(entry: MdeCalendarEntry): MdeCalendarEntrySelectedState {
    if (this._selectedPeriod != null) {
      let selectionStart: moment.Moment = momentConstructor(this._selectedPeriod.startDate)
        .startOf('day');
      let selectionEnd: moment.Moment = momentConstructor(this._selectedPeriod.endDate)
        .endOf('day');
      let selectionPeriodOrder: number = this._periodOrder(this._selectedPeriod.type);

      let entryPeriodOrder: number = this._periodOrder(entry.type);
      let entryRange: {start: moment.Moment, end: moment.Moment} = entry.getRange();

      if (entryPeriodOrder <= selectionPeriodOrder &&
        entryRange.start.isBetween(selectionStart, selectionEnd, undefined, '[]') &&
        entryRange.end.isBetween(selectionStart, selectionEnd, undefined, '[]')
      ) {
        return 'full';
      } else if (entryPeriodOrder > selectionPeriodOrder &&
        selectionStart.isBetween(entryRange.start, entryRange.end, undefined, '[]') &&
        selectionEnd.isBetween(entryRange.start, entryRange.end, undefined, '[]')
      ) {
        return 'partial';
      }
    }

    return 'none';
  }

  private _refreshSelection(): void {
    for (let row of this._calendarRows) {
      for (let entry of row) {
        entry.selected = this._isEntrySelected(entry);
      }
    }
  }

  private _canSelectEntry(entry: MdeCalendarEntry): boolean {
    if (['day', 'week'].indexOf(this._selectionMode) >= 0 && entry.type != 'day') {
      return false;
    }
    if (this._selectionMode == 'month' && entry.type == 'year') {
      return false;
    }
    return true;
  }

  private _nextViewMode(entry: MdeCalendarEntry): void {
    if (this._viewMode == 'decade') {
      this._viewMode = 'year';
    } else if (this._viewMode == 'year') {
      this._viewMode = 'month';
    } else if (this._viewMode == 'month') {
      return;
    }
    this._viewDate = entry.date;
    this._buildCalendar();
  }
}
