
import 'amcharts3'
import 'amcharts3/amcharts/serial'
// import 'amcharts3/amcharts/gauge'
import 'amcharts3/amcharts/themes/light';


// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {

  Vue.prototype.$AmCharts = AmCharts

  /**
   * Amcharts Queue: https://www.amcharts.com/kbase/optimizing-multi-chart-periodically-updated-dashboards/
   */

  /**
   * Initialize a chart update queue
   */
  Vue.prototype.$AmCharts.updateQueue = [];

  /**
   * Queues data update for the chart
   */
  Vue.prototype.$AmCharts.queueDataUpdate = function(chart, data) {

    // chart is already in queue?
    for (var i = 0; i < Vue.prototype.$AmCharts.updateQueue; i++) {
      if (Vue.prototype.$AmCharts.updateQueue[i].chart = chart) {
        Vue.prototype.$AmCharts.updateQueue[i].data = data
        return;
      }
    }

    // insert into queue
    Vue.prototype.$AmCharts.updateQueue.push({
      "chart": chart,
      "data": data
    });

    // process next item
    Vue.prototype.$AmCharts.processUpdateQueue();
  };

  /**
   * Updates the next chart in queue
   */
  Vue.prototype.$AmCharts.processUpdateQueue = function() {
    console.log('processUpdateQueue...', Vue.prototype.$AmCharts.updateQueue.length)

    if (Vue.prototype.$AmCharts.updateQueue.length) {
      var item = Vue.prototype.$AmCharts.updateQueue.shift();
      if(item.data)
        item.chart.dataProvider = item.data;

      item.chart.validateData();
    }
  };


}
