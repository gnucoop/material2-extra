import { Component, ViewChild } from '@angular/core';
import {
  MdCalendar, MdCalendarPeriodType, MdCalendarViewMode, MdCalendarWeekDay
} from '@material2-extra/calendar/calendar';

@Component({
  moduleId: module.id,
  selector: 'demo-app',
  templateUrl: 'demo-app.html',
  styleUrls: ['demo-app.css'],
  directives: [MdCalendar]
})
export class DemoApp {
  @ViewChild(MdCalendar)
  calendarComponent: MdCalendar;

  constructor() {
  }

  setSelectionMode(selMode: MdCalendarPeriodType): void {
    if (this.calendarComponent == null) {
      return;
    }

    if (this.calendarComponent.selectionMode != selMode) {
      this.calendarComponent.selectionMode = selMode;
    }
  }

  setViewMode(viewMode: MdCalendarViewMode): void {
    if (this.calendarComponent == null) {
      return;
    }

    if (this.calendarComponent.viewMode != viewMode) {
      this.calendarComponent.viewMode = viewMode;
    }
  }

  setFirstDayOfWeek(firstDayOfWeek: MdCalendarWeekDay): void {
    if (this.calendarComponent == null) {
      return;
    }

    if (this.calendarComponent.startOfWeekDay != firstDayOfWeek) {
      this.calendarComponent.startOfWeekDay = firstDayOfWeek;
    }
  }
}
