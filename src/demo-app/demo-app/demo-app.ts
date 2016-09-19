import { Component, ViewChild } from '@angular/core';
import {
  MdCalendar, MdCalendarPeriodType, MdCalendarViewMode, MdCalendarWeekDay,
  MD_CALENDAR_DIRECTIVES
} from '@material2-extra/calendar/calendar';
import { MD_MASONRY_DIRECTIVES } from '@material2-extra/masonry/masonry';

@Component({
  moduleId: module.id,
  selector: 'demo-app',
  templateUrl: 'demo-app.html',
  styleUrls: ['demo-app.css'],
  directives: [MD_CALENDAR_DIRECTIVES, MD_MASONRY_DIRECTIVES]
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
