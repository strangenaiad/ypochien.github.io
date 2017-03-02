/**
 * Created by ypochien on 2017/3/2.
 */
var mqtt;
var reconnectTimeout = 2000;
function MQTTconnect() {
    if (typeof path == "undefined") {
        path = '/mqtt';
    }
    mqtt = new Paho.MQTT.Client(
        host,
        port,
        path,
        "web_" + parseInt(Math.random() * 2000, 10)
    );
    var options = {
        timeout: 3,
        useSSL: useTLS,
        cleanSession: cleansession,
        onSuccess: onConnect,
        onFailure: function (message) {
            $('#status').val("Connection failed: " + message.errorMessage + "Retrying");
            setTimeout(MQTTconnect, reconnectTimeout);
        }
    };

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;

    if (username != null) {
        options.userName = username;
        options.password = password;
    }
    console.log("Host=" + host + ", port=" + port + ", path=" + path + " TLS = " + useTLS + " username=" + username + " password=" + password);
    mqtt.connect(options);
}

function onConnect() {
    $('#status').val('Connected to ' + host + ':' + port + path);
    // Connection succeeded; subscribe to our topic
    mqtt.subscribe(topic, {qos: 0});
    $('#topic').val(topic);
}

function onConnectionLost(response) {
    setTimeout(MQTTconnect, reconnectTimeout);
    $('#status').val("connection lost: " + responseObject.errorMessage + ". Reconnecting");

}
function onMessageArrived(message) {
    var debug = document.getElementById("debug");
    var tbMatch = document.getElementById("tbMatch");
    var topic = message.destinationName;
    var payload = message.payloadString;
    var obj = JSON.parse(payload);
    if(topic[0] == 'Q'){
        //console.log('Q',topic,obj);
    }
    if(topic[0] == 'L'){
        //console.log('L',topic,obj);
        if(commodities.hasOwnProperty(topic)) {

        }
        else{
            commodities[topic] = new Commodity(topic);
        }
        var real_timestamp = parseInt(obj.TimeStamp)*1000;
        console.log(topic,real_timestamp);
        commodities[topic].append( parseFloat(obj.Close), obj.Volume ,real_timestamp);
    }
};
var chart;
var dataPoints = [];
var volume_points = [];
$(function () {
    var tt = ((new Date()).getTime());
    console.log(tt);
    chart = new CanvasJS.Chart("chartContainer", {
        theme: "theme2",
        title: {
            text: "CMX:GC:J17"
        },
        zoomEnabled: true,
        axisX: {
            title: "time",
            minimum: tt - 60000,
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

function Commodity(code) {
    this.code = code;
    this.volumePoints = [];
    this.closePoints = [];
}

Commodity.prototype.append = function(Close, Volume, timeStamp){
    this.closePoints.push({x: timeStamp, y: Close});
    this.volumePoints.push({x: timeStamp, y: Volume});
    if (this.closePoints.length > 300) {
        this.closePoints.shift();
        this.volumePoints.shift();
    }
}

function updateCharts() {

    var tt =new Date().valueOf();
    //chart.options.axisX.minimum = tt - 60000;
    chart_topic = "L/NYM/CL/J17";
    if(chart.options.title.text != chart_topic ) {
        chart.options.title.text = chart_topic;
        chart.options.data[0].dataPoints = commodities[chart_topic].closePoints;
        chart.options.data[1].dataPoints = commodities[chart_topic].volumePoints;
    }
    chart.options.axisX.minimum = commodities[chart_topic].closePoints[commodities[chart_topic].closePoints.length-1].x - 60000;
    chart.render();
}

var commodities = {};
commodities['test'] = new Commodity('test');
setInterval(updateCharts, 1000);
$(document).ready(function () {
    MQTTconnect();
});