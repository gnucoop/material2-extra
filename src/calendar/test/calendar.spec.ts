import { async, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { MdeCalendar, MdeCalendarPeriod } from '../src/calendar/index';
import { MdeCalendarModule } from '../src/calendar_module';

import * as moment from 'moment';


describe('MdeCalendar', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, MdeCalendarModule],
      declarations: [MdeCalendarBasicTestComponent, MdeCalendarMonthViewTestComponent]
    });
    TestBed.compileComponents();
  }));

  describe('basic behaviors', () => {
    it('creates an action header and entry rows', () => {
      let fixture = TestBed.createComponent(MdeCalendarBasicTestComponent);
      fixture.detectChanges();

      let calendarItem = fixture.debugElement.query(By.directive(MdeCalendar));
      expect(calendarItem.query(By.css('.mde-calendar-header'))).toBeTruthy();
      expect(calendarItem.query(By.css('.mde-calendar-row'))).toBeTruthy();
    });

    it('should display the current month', () => {
      let fixture = TestBed.createComponent(MdeCalendarBasicTestComponent);
      fixture.detectChanges();

      let calendarItem = fixture.debugElement.query(By.directive(MdeCalendar));
      let calendarRows = calendarItem.queryAll(By.css('.mde-calendar-row'));

      let startDate = moment().startOf('month').startOf('week');
      let endDate = moment().endOf('month').endOf('week').add(1, 'day');
      expect(calendarRows.length).toBe(endDate.diff(startDate, 'weeks') + 1);

      let curDate = startDate.clone();
      let rowIdx = 1;
      let colIdx = 0;
      let curRow = calendarRows[rowIdx];
      while (curRow != null && curDate.isBefore(endDate)) {
        if (colIdx >= curRow.children.length) {
          curRow = calendarRows[++rowIdx];
          colIdx = 0;
        }
        if (curRow != null) {
          expect(
            parseInt(
              curRow
                .children[colIdx]
                .query(By.css('.mat-button-wrapper')).nativeElement.innerHTML,
              10
            )
          ).toBe(curDate.date());
          colIdx++;
          curDate.add(1, 'day');
        }
      }
    });

    it('supports ngModel', (done: () => void) => {
      let fixture = TestBed.createComponent(MdeCalendarBasicTestComponent);
      fixture.detectChanges();

      let instance = fixture.componentInstance;
      let component = fixture.debugElement.query(By.directive(MdeCalendar)).componentInstance;

      let curDate = new Date();
      instance.model = <MdeCalendarPeriod>{
        type: 'day',
        startDate: curDate,
        endDate: curDate
      };

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        let selected = fixture.debugElement.queryAll(By.css('button.mat-warn'));
        expect(selected.length).toEqual(1);
        expect(parseInt(selected[0].nativeElement.children[0].innerHTML, 10))
          .toEqual(curDate.getDate());

        curDate = moment(curDate).add(1, 'day').toDate();
        component.value = <MdeCalendarPeriod>{
          type: 'day',
          startDate: curDate,
          endDate: curDate
        };

        fixture.detectChanges();

        selected = fixture.debugElement.queryAll(By.css('button.mat-warn'));
        expect(selected.length).toEqual(1);
        expect(parseInt(selected[0].nativeElement.children[0].innerHTML, 10))
          .toEqual(curDate.getDate());
        done();
      });
    });
  });

  describe('year view', () => {
    it('should display the current year', (done: () => void) => {
      let fixture = TestBed.createComponent(MdeCalendarMonthViewTestComponent);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        let calendarItem = fixture.debugElement.query(By.directive(MdeCalendar));
        let calendarRows = calendarItem.queryAll(By.css('.mde-calendar-row'));

        let startDate = moment().startOf('year');
        let endDate = moment().endOf('year').add(1, 'day');
        let totalEntries = 0;
        for (let i = 0 ; i < calendarRows.length ; i++) {
          totalEntries += calendarRows[i].queryAll(By.css('button')).length;
        }
        expect(totalEntries).toBe(12);

        let curDate = startDate.clone();
        let rowIdx = 0;
        let colIdx = 0;
        let curRow = calendarRows[rowIdx];
        while (curRow != null && curDate.isBefore(endDate)) {
          if (colIdx >= curRow.children.length) {
            curRow = calendarRows[++rowIdx];
            colIdx = 0;
          }
          if (curRow != null) {
            expect(curRow.children[colIdx]
              .query(By.css('.mat-button-wrapper')).nativeElement.innerHTML.trim())
              .toBe(curDate.format('MMM'));
            colIdx++;
            curDate.add(1, 'month');
          }
        }

        done();
      });
    });
  });
});

@Component({
  selector: 'mde-calendar-test-component',
  template: `<mde-calendar [(ngModel)]="model"></mde-calendar>`
})
class MdeCalendarBasicTestComponent {
  model: MdeCalendarPeriod;
}

@Component({
  selector: 'mde-calendar-test-component',
  template: `<mde-calendar view-mode="year"></mde-calendar>`
})
class MdeCalendarMonthViewTestComponent {
}
