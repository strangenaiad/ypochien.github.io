/**
 * Created by ypochien on 2017/3/2.
 */
var chart;
var dataPoints = [];
var volume_points = [];
$(function () {
    var tt = ((new Date()).getTime());
    chart = new CanvasJS.Chart("chartContainer", {
        title: {
            text: "CMX:GC:J17"
        },
        zoomEnabled: true,
        axisX: {
            title: "time",
            min: tt - 60000,
            gridThickness: 3,
            tickThickness: 5,
            interval: 5000,
            tickLength: 5,
            intervalType: "millisecond",
            valueFormatString: "hh:mm:ss",
            labelAngle: -20
        },
        axisY: [
            {
                includeZero: false,
                showInLegend: true,
                title: " 價格",
            }],
        axisY2: [
            {
                includeZero: false,
                showInLegend: true,
                title: " 數量",
            }
        ],
        data: [{
            type: "line",
            axisYIndex: 0,
            connectNullData: true,
            nullDataLineDashType: "solid",
            xValueType: "dateTime",
            dataPoints: dataPoints
        }, {
            type: "column",
            axisYIndex: 1,
            lineThickness: 5,
            axisYType: "secondary",
            xValueType: "dateTime",
            dataPoints: volume_points
        }]
    });
    chart.render();
});

function commodity(code) {
    this.code = code;
    this.volumePoints = [];
    this.closePoints = [];
}

function append(obj, close, volume, timeStamp) {
    obj.closePoints.push({x: timeStamp, y: close});
    obj.volumePoints.push({x: timeStamp, y: volume});
    if (obj.closePoints.length > 300) {
        obj.closePoints.shift();
        obj.volumePoints.shift();
    }
}


var commodities = {};
commodities['test'] = new commodity('test');

function updateCharts() {

    var tt = ((new Date()).getTime());
    append(commodities['test'], Math.random() * 2000 + 8000, Math.random() * 10, tt);
    chart.options.axisX.minimum = tt - 60000;
    //dataPoints.push({x:tt,y:9800});
    //volume_points.push({x:tt,y:12});
    chart.options.data[0].dataPoints = commodities['test'].closePoints;
    chart.options.data[1].dataPoints = commodities['test'].volumePoints;
    chart.render();
}

setInterval(updateCharts, 1000);