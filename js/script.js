var map = L.map('map').fitWorld();
var currentMarker = 0;
var markerStart;
var markerStartPos;
var markerEnd;
var markerEndPos;
var polyline;

var dateStart;
var timeStart;
var dateEnd;
var timeEnd;

var greenIcon = L.icon({
    iconUrl: 'css/images/green-icon.png',
    iconSize:     [25, 41], // size of the icon
    iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var redIcon = L.icon({
    iconUrl: 'css/images/red-icon.png',
    iconSize:     [25, 41], // size of the icon
    iconAnchor:   [12, 40], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: ['a','b','c']
}).addTo( map );

function onLocationFound(e) {
    
}

function onMapClick(e) {

    console.log(e.latlng);

    if (currentMarker === 0) {
        markerStart = L.marker(e.latlng, {icon: greenIcon}).addTo(map);
        currentMarker = 1;
        markerStartPos = e.latlng;
    }
    else if (currentMarker === 1) {
        markerEnd = L.marker(e.latlng, {icon: redIcon}).addTo(map);
        currentMarker = 2;
        markerEndPos = e.latlng;

        polyline = new L.polyline([markerStartPos, markerEndPos], {
            color: 'blue',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
        });
        map.addLayer(polyline);
    }
    else if (currentMarker === 2) {
        markerStart.setLatLng(e.latlng); 
        currentMarker = 3;
        markerStartPos = e.latlng;

        map.removeLayer(polyline);
        polyline = new L.polyline([markerStartPos, markerEndPos], {
            color: 'blue',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
        });
        map.addLayer(polyline);
        
    }
    else if (currentMarker === 3) {
        markerEnd.setLatLng(e.latlng); 
        currentMarker = 2;
        markerEndPos = e.latlng;

        map.removeLayer(polyline);
        polyline = new L.polyline([markerStartPos, markerEndPos], {
            color: 'blue',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
        });
        map.addLayer(polyline);

        var sunPos = SunCalc.getPosition(new Date(), markerStartPos.lat, markerStartPos.lng);
        console.log(sunPos);
    }


}

map.on('click', onMapClick);

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);

map.locate({setView: true, maxZoom: 16});

function dateAdd(date, interval, units) {
  var ret = new Date(date); //don't change original date
  var checkRollover = function() { if(ret.getDate() != date.getDate()) ret.setDate(0);};
  switch(interval.toLowerCase()) {
    case 'year'   :  ret.setFullYear(ret.getFullYear() + units); checkRollover();  break;
    case 'quarter':  ret.setMonth(ret.getMonth() + 3*units); checkRollover();  break;
    case 'month'  :  ret.setMonth(ret.getMonth() + units); checkRollover();  break;
    case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
    case 'day'    :  ret.setDate(ret.getDate() + units);  break;
    case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
    case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
    case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
    default       :  ret = undefined;  break;
  }
  return ret;
}

function lineInterpolate( point1, point2, steps )
{
  var xabs = Math.abs( point1.x - point2.x );
  var yabs = Math.abs( point1.y - point2.y );
  var xdiff = point2.x - point1.x;
  var ydiff = point2.y - point1.y;
 
  var length = Math.sqrt( ( Math.pow( xabs, 2 ) + Math.pow( yabs, 2 ) ) );
  var xstep = xdiff / steps;
  var ystep = ydiff / steps;
 
  var newx = 0;
  var newy = 0;
  var result = new Array();
 
  for( var s = 0; s < steps; s++ )
  {
    newx = point1.x + ( xstep * s );
    newy = point1.y + ( ystep * s );
 
    result.push( {
      x: newx,
      y: newy
    } );
  }
 
  return result;
}

function spoofSunAzimuth() {
    return { azimuth: Math.PI, altitude: 10 };
}

function validate() {
    var title = "Stop!";
    if (!markerStartPos) {
        alert(
            'Please click on the map to place the departure location.',  // message
            function() {return false;},
            title,
            'Okay'
        );
        return false;
    }
    if (!markerEndPos) {
        alert(
            'Please click on the map to place the arrival location.',  // message
            function() {return false;},
            title,
            'Okay'
        );
        return false;
    }
    if (!dateStart) {
        alert(
            'Please choose a departure date.',  // message
            function() {return false;},
            title,
            'Okay'
        );
        return false;
    }
    if (!timeStart) {
        alert(
            'Please choose a departure time.',  // message
            function() {return false;},
            title,
            'Okay'
        );
        return false;
    }
    if (!dateEnd) {
        alert(
            'Please choose an arrival date.',  // message
            function() {return false;},
            title,
            'Okay'
        );
        return false;
    }
    if (!timeEnd) {
        alert(
            'Please choose an arrival time.',  // message
            function() {return false;},
            title,
            'Okay'
        );
        return false;
    }
    if (dateEnd < dateStart) {
        alert(
            'Please choose an arrival date later than departure date.',  // message
            function() {return false;},
            title,
            'Okay'
        );
        return false;
    }
    return true;
}

function calculate() {
	
	dateStart = new Date($("#datestart").val());
	dateEnd = new Date($("#dateend").val());
	timeStart = new Date($("#datestart").val());
	timeEnd = new Date($("#dateend").val());

    if (!validate()) {
        return;
    }

    var startTimeDate = new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate(), 
               timeStart.getHours(), timeStart.getMinutes(), timeStart.getSeconds());
    var endTimeDate = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate(), 
               timeEnd.getHours(), timeEnd.getMinutes(), timeEnd.getSeconds());

    var cnt = 0;

    var sampleDates = [];
    while (startTimeDate < endTimeDate) {
        startTimeDate = dateAdd(startTimeDate, 'minute', 5);
        sampleDates.push(new Date(startTimeDate.getTime()));
        cnt++;
    }
    var samplePoints = lineInterpolate( { x: markerStartPos.lng, y: markerStartPos.lat }, { x: markerEndPos.lng, y: markerEndPos.lat }, cnt );

    var vehicle = Math.atan2(markerEndPos.lng - markerStartPos.lng, markerEndPos.lat - markerStartPos.lat) * (180 / Math.PI);
    
    var leftSideStart = 0;
    var leftSideEnd = 0;
    var inv = false;

    if (vehicle > 0) {
        leftSideStart = vehicle - 180;
        leftSideEnd = vehicle;
    }
    else {
        inv = true;
        leftSideStart = vehicle + 180;
        leftSideEnd = vehicle;
    }
    var left = 0;
    var right = 0;
    
    for (var i = 0; i < samplePoints.length; i++) {
        if (sampleDates[i]) {
            var sunPos = SunCalc.getPosition(sampleDates[i], samplePoints[i].y, samplePoints[i].x);
            if (sunPos.altitude >= 0) {
                var sun = sunPos.azimuth * (180 / Math.PI) - 180;

                if (inv === false) {
                    if (sun >= leftSideStart && sun < leftSideEnd) {
                        left++;
                    }
                    else {
                        right++;
                    }
                }
                else {
                    if (sun <= leftSideEnd || sun > leftSideStart) {
                        left++;
                    }
                    else {
                        right++;
                    }
                }

            }
        }
    }

    var choice = "Sit on your left hand side to avoid sun in your face!";
    if (left > right) {
        choice = "Sit on your right hand side to avoid sun in your face!"
    }
    else if (left === right) {
        choice = "Sit on any side to avoid sun in your face!";
    }

confirm(
            "Approximate sun minutes: \n\nLeft side: " + (left * 5) + "\nRight side: " + (right * 5) + "\n\n" + choice,  // message
            function() {return true;},
            "Result",
            'Okay!'
        );
}