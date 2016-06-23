import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  Provider
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ControlValueAccessor
} from '@angular/common';

import { MD_BUTTON_DIRECTIVES } from '@angular2-material/button/button';

import { Observable } from 'rxjs/Rx';

import * as moment from 'moment';


let ISODAYS: {[dayName: string]: number} = {
  'monday': 1,
  'tuesday': 2,
  'wednesday': 3,
  'thursday': 4,
  'friday': 5,
  'saturday': 6,
  'sunday': 7
};

let ISODAYS_REV: {[dayNum: number]: string} = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'sunday'
};

const MD_CALENDAR_CONTROL_VALUE_ACCESSOR = new Provider(NG_VALUE_ACCESSOR, {
  useExisting: forwardRef(() => MdCalendar),
  multi: true
});

export class MdCalendarPeriod {
  type: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
}

export class MdCalendarChange {
  source: MdCalendar;
  period: MdCalendarPeriod;
}

export class MdCalendarEntry {
  type: 'day' | 'month' | 'year';
  date: Date;
  selected: boolean;
}

@Component({
  moduleId: module.id,
  selector: 'md-calendar',
  templateUrl: 'calendar.html',
  styleUrls: ['calendar.css'],
  directives: [MD_BUTTON_DIRECTIVES],
  providers: [MD_CALENDAR_CONTROL_VALUE_ACCESSOR]
})
export class MdCalendar implements ControlValueAccessor {
  private _viewDate: Date = new Date();
  private _viewMoment: moment.Moment = moment();

  private _onChangeCallback: (_: any) => void = (_: any) => {};
  private _onTouchedCallback: () => void = () => {};

  get viewDate(): Date { return this._viewDate; };
  @Input('view-date')
  set viewDate(viewDate: Date) { this._setViewDate(viewDate); }

  private _viewMode: 'week' | 'month' | 'year' = 'month';

  get viewMode(): 'week' | 'month' | 'year' { return this._viewMode; }
  @Input('view-mode')
  set viewMode(viewMode: 'week' | 'month' | 'year') { this._viewMode = viewMode; }

  private _selectionMode: 'day' | 'week' | 'month' | 'year' = 'day';

  get selectionMode(): 'day' | 'week' | 'month' | 'year' { return this._selectionMode; }
  @Input('selection-mode')
  set selectionMode(selectionMode: 'day' | 'week' | 'month' | 'year') {
    this._selectionMode = selectionMode;
  }

  private _startOfWeekDay: number = 1;

  get startOfWeekDay(): string { return ISODAYS_REV[this._startOfWeekDay]; }
  @Input('start-of-week-day')
  set startOfWeekDay(weekDay: string) {
    if (!ISODAYS.hasOwnProperty(weekDay)) {
      throw new Error('Invalid week day');
    }
    this._startOfWeekDay = ISODAYS[weekDay];
  }

  private _change: EventEmitter<MdCalendarChange> = new EventEmitter<MdCalendarChange>();
  @Output()
  public change(): Observable<MdCalendarChange> { return this._change.asObservable(); }

  private _selectedPeriod: MdCalendarPeriod;
  get value(): MdCalendarPeriod { return this._selectedPeriod; }
  set value(period: MdCalendarPeriod) {
    if (period != this.value) {
      this._selectedPeriod = period;
      this._onChangeCallback(period);
      this._change.emit({
        source: this,
        period: period
      });
      this._refreshSelection();
    }
  }

  private _calendarRows: MdCalendarEntry[][] = [];
  private _weekDays: string[] = [];

  constructor() {
    this._buildCalendarDates();
  }

  registerOnChange(fn: (value: any) => void) {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this._onTouchedCallback = fn;
  }

  writeValue(value: any) {
    this.value = value;
  }

  private _setViewDate(date: Date): void {
    this._viewDate = date;
    this._viewMoment = moment(date);
  }

  private _buildCalendarDates(): void {
    if (this._viewMode == 'month') {
      this._buildMonthViewCalendarDates();
    }
  }

  private _buildMonthViewCalendarDates(): void {
    this._buildMonthViewWeekDays();

    let viewStartDate: moment.Moment = moment(this.viewDate)
      .startOf('month')
      .startOf('isoWeek');
    let viewEndDate: moment.Moment = moment(this.viewDate)
      .endOf('month')
      .endOf('isoWeek');

    var rows: any[][] = [];
    var curDate = moment(viewStartDate);
    while (curDate < viewEndDate) {
      let row: any[] = [];
      for (let i = 0 ; i < 7 ; i++) {
        let date = new Date(curDate.toDate().valueOf());
        row.push({
          date: date,
          selected: this._isDateSelected(date)
        });
        curDate.add(1, 'd');
      }
      rows.push(row);
    }

    this._calendarRows = rows;
  }

  private _buildMonthViewWeekDays(): void {
    this._weekDays = Object.keys(ISODAYS).map(d => `${d[0].toUpperCase()}${d.slice(1)}`);
  }

  private _prevPage(): void {
    if (this._viewMode == 'month') {
      this.viewDate = moment(this.viewDate).subtract(1, 'M').toDate();
    }
    this._buildCalendarDates();
  }

  private _nextPage(): void {
    if (this._viewMode == 'month') {
      this.viewDate = moment(this.viewDate).add(1, 'M').toDate();
    }
    this._buildCalendarDates();
  }

  private _isDateSelected(date: Date): boolean {
    if (this._selectedPeriod == null) {
      return false;
    }
    let time: number = date.getTime();
    return time >= this._selectedPeriod.startDate.getTime() &&
      time <= this._selectedPeriod.endDate.getTime();
  }

  private _refreshSelection(): void {
    for (let row of this._calendarRows) {
      for (let entry of row) {
        entry.selected = this._isDateSelected(entry.date);
      }
    }
  }

  private _selectDate(entry: MdCalendarEntry): void {
    let newPeriod: MdCalendarPeriod;
    if (this._isDateSelected(entry.date)) {
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
        startDate: new Date(moment(entry.date).startOf('isoWeek').toDate().valueOf()),
        endDate: new Date(moment(entry.date).endOf('isoWeek').toDate().valueOf())
      };
    } else if (this._selectionMode == 'month') {
      newPeriod = {
        type: 'month',
        startDate: new Date(moment(entry.date).startOf('month').toDate().valueOf()),
        endDate: new Date(moment(entry.date).endOf('month').toDate().valueOf())
      };
    } else if (this._selectionMode == 'year') {
      newPeriod = {
        type: 'year',
        startDate: new Date(moment(entry.date).startOf('year').toDate().valueOf()),
        endDate: new Date(moment(entry.date).endOf('year').toDate().valueOf())
      };
    }
    this.value = newPeriod;
  }
}
