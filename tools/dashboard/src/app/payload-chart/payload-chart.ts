import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {PayloadResult} from '../data-definitions';
import {NgxChartItem, NgxChartResult} from './ngx-definitions';

@Component({
  selector: 'payload-chart',
  templateUrl: './payload-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayloadChart {

  /** Color scheme for the payload graph. */
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  /** X-Axis label of the Chart. */
  xAxisLabel = 'Date';

  /** Y-Axis label of the Chart. */
  yAxisLabel = 'Payload Size (kb)';

  /** Chart data that is taken by NGX-Charts. */
  chartData: NgxChartResult[];

  /** Payload data that will be rendered in the chart. */
  @Input()
  set data(value: PayloadResult[]) {
    this.chartData = this.createChartResults(value);
  }

  /** Creates a list of ngx-chart results of the Payload results. */
  private createChartResults(data: PayloadResult[]) {
    if (!data) {
      return [];
    }

    // Data snapshot from Firebase is not ordered by timestamp. Before rendering the graph
    // manually sort the results by their timestamp.
    data = data.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1);

    const m2eCalendarChartItems: NgxChartItem[] = [];
    const m2eMasonryChartItems: NgxChartItem[] = [];

    // Walk through every result entry and create a NgxChart item that can be rendered inside of
    // the linear chart.
    data.forEach(result => {
      if (!result.m2e_calendar_fesm_2015 || !result.m2e_masonry_fesm_2015) {
        return;
      }

      // Convert the timestamp of the payload result into a date because NGX-Charts can group
      // dates in the x-axis.
      const date = new Date(result.timestamp);

      m2eCalendarChartItems.push({ name: date, value: result.m2e_calendar_fesm_2015 });
      m2eMasonryChartItems.push({ name: date, value: result.m2e_masonry_fesm_2015 });
    });

    return [
      { name: 'M2E Calendar', series: m2eCalendarChartItems },
      { name: 'M2E Masonry', series: m2eMasonryChartItems }
    ];
  }

}

