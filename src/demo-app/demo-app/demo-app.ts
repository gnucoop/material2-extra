import { Component } from '@angular/core';
import { MdCalendar, MdCalendarPeriod } from '@material2-extra/calendar/calendar';

@Component({
  moduleId: module.id,
  selector: 'demo-app',
  templateUrl: 'demo-app.html',
  styleUrls: ['demo-app.css'],
  directives: [MdCalendar]
})
export class DemoApp {
  testPeriod: MdCalendarPeriod = {
    type: 'week',
    startDate: new Date(2016, 5, 6),
    endDate: new Date(2016, 5, 12)
  };

  constructor() {
  }
}
