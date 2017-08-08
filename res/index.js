var day_names = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
var month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var c_month;
var c_day;
var c_date;
var c_year;
var c_hr;
var c_min;
var d_weekstart;
var d_weekend;
var c_sunrise;
var c_sunset;
var c_map_initalized;
var c_lat;
var c_lng;

var c_menu_transitioning = false;

var c_map_loaded;
var c_container_loaded;

var c_loading = true;

function updateNews() {
    feednami.load("https://news.google.com/news/rss/?ned=ca&hl=CA").then(feed => {
      $('.rss-carousel ul').empty();
      for (let entry of feed.entries) {
        var img_src = $('img', $.parseHTML(entry.summary)).attr('src');
        $('.rss-carousel ul').append('<li><div class="li-center">'+entry.title+'</div></li>');
      }

      $('.rss-carousel').jcarousel({
            vertical: true, 
            wrap: 'circular', 
            animation: {
                duration: 2000,
                easing: 'easeInOutCubic'
            }
        });

      setInterval(function() {
        $('.rss-carousel').jcarousel('scroll', '+=1');
      }, 10000);
 });
}

function updateDateAndTime() {
    var currentTime = new Date();
    var hr = currentTime.getHours();
    var min = currentTime.getMinutes();
    var day = currentTime.getDay();
    var month = currentTime.getMonth();
    var date = currentTime.getDate();
    var year = currentTime.getFullYear();

    hr = (hr < 10 ? "0" : "") + hr;
    min = (min < 10 ? "0" : "") + min;

    if (c_hr != hr) {
        $(".hour").text(hr);
        c_hr = hr;
        if (c_lat != 0 && c_lng != 0) {
            updateWeather(c_lat, c_lng);    
        }
        updateNews();
    }
    
    if (c_min != min) {
        $(".minute").text(min);
        c_min = min;
    }


    if (c_month != month) {
        $("#date .month").text(month_names[month]);
        c_month = month;    
    }
    
    if (c_date != date) {
        c_day = day;
        $("#date .day").text(day_names[day]);
        $("#date .date").text(date);

        var datesuffix = "th";

        if ((date - (date % 10)) / 10 != 1) {
            switch (date % 10) {
                case 1:
                datesuffix = "st";
                break;
                case 2: 
                datesuffix = "nd";
                break;
                case 3:
                datesuffix = "rd";
                break;
            }
        }

        $("#date .datesuffix").text(datesuffix);
        c_date = date;

        var d = new Date();
        d.setDate(d.getDate() - day);

        d_weekstart = new Date(d);

        d_weekend = new Date(d);
        d_weekend.setDate(d.getDate() + 6);
     
        for (var i = 0; i < 7; i++) {
            d_weekstart.setDate(d.getDate() + i);
            $("#date .calendar .cal").eq(i).text(d_weekstart.getDate());
            
            if (i == day) {
                $("#date .calendar .cal").eq(i).addClass('today');
            } else {
                $("#date .calendar .cal").eq(i).removeClass('today');
            }
        }

    }

    if (c_year != year) {
        $("#date .year").text(year);
        c_year = year;
    }
}

function updateLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onLocationUpdated);
    }
}

function onLocationUpdated(pos) {
    c_lat = pos.coords.latitude;
    c_lng = pos.coords.longitude;
    console.log("Location loaded");
    updateCity(pos.coords.latitude, pos.coords.longitude);
}

function updateCity(lat, lon) {
    $.get("https://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&result_type=locality&latlng="+lat+","+lon+"&key="+mapsKey,
    function(data) {
        var city = data.results[0].address_components[0].short_name;
        $('#weather .city').text(city);
        console.log("City loaded");
        updateWeather(lat, lon);
    });
}

function id2Icon(id) {
 switch(id) {
            case 800:
                return '<div class="icon sunny"><div class="sun"><div class="rays"></div></div></div>';
            case 511:
            case 520:
            case 521:
            case 522:
            case 531:
                return '<div class="icon rainy"><div class="cloud"></div><div class="rain"></div></div>';
            case 500:
            case 501:
            case 502:
            case 503:
            case 504:
                return '<div class="icon sun-shower"><div class="cloud"></div><div class="sun"><div class="rays"></div></div><div class="rain"></div></div>';
            case 200:
            case 201:
            case 202:
            case 210:
            case 212:
            case 221:
            case 230:
            case 231:
            case 232:
            case 901:
            case 902:
            case 960:
            case 961:
            case 962:
                return '<div class="icon thunder-storm"><div class="cloud"></div><div class="lightning"><div class="bolt"></div><div class="bolt"></div></div></div>'
            case 600:
            case 601:
            case 602:
            case 611:
            case 612:
            case 615:
            case 616:
            case 620:
            case 621:
            case 622:
            case 906:
                return '<div class="icon flurries"><div class="cloud"></div><div class="snow"><div class="flake"></div><div class="flake"></div></div></div>';
            default:
                return '<div class="icon cloudy"><div class="cloud"></div><div class="cloud"></div></div>';
        }
}

function updateWeather(lat, lon) {
    $.get("http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&appid="+weatherKey,
    function(data) {
        var temp = Math.round(data.main.temp - 273.15);
        $("#weather .temp").text(temp);
        $("#weather .text").text(data.weather[0].description);
        var id = data.weather[0].id;        
        $('.icon-container').html(id2Icon(id));

        c_sunrise = data.sys.sunrise;
        c_sunset = data.sys.sunset;
        console.log("Weather loaded");
        updateForecast(lat, lon);
    });
}

function updateForecast(lat, lon) {
    $.get("http://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lon+"&appid="+weatherKey,
    function(data) {
		$('#forecast-tList').innerHTML = "";
		$('#forecast-wList').innerHTML = "";
        var forecast = data.list;
		var day = 1;
        for (var i = 0; i < 8; i++) {
            var entry = forecast[i];
            var hi = Math.round(entry.main.temp_max - 273.15);
            var lo = Math.round(entry.main.temp_min - 273.15);
            var desc = entry.weather[0].description;
            var id = entry.weather[0].id;
			var hr = ((parseInt(entry.dt_txt.substr(11,2))+16)%24);
            $('#forecast-tList').append('<li>'+id2Icon(id)+'<div class="forecast-description"><span class="temp">High: <span class="value">'+hi+'</span></span><br><span class="temp">Low: <span class="value">'+lo+'</span></span><br>'+desc+'</div><div class="forecast-time">'+(hr<10?'0':'')+hr+':00</div></li>');
        }
        for (var i = 8; i < forecast.length; i += 8) {
            var entry = forecast[i];
            var hi = Math.round(entry.main.temp_max - 273.15);
            var lo = Math.round(entry.main.temp_min - 273.15);
            var desc = entry.weather[0].description;
            var id = entry.weather[0].id;
            $('#forecast-wList').append('<li>'+id2Icon(id)+'<div class="forecast-description"><span class="temp">High: <span class="value">'+hi+'</span></span><br><span class="temp">Low: <span class="value">'+lo+'</span></span><br>'+desc+'</div><div class="forecast-time">Day '+day+'</div></li>');
			day++;
        }
        console.log("Forecast loaded");
        updateHoliday();
    });
}

function updateHoliday() {

    var month = c_month + 1;

    $.get("http://kayaposoft.com/enrico/json/v1.0/index.php?action=getPublicHolidaysForMonth&month="+month+"&year="+c_year+"&country=can&region=british-columbia", function(holidays) {

        if (!Array.isArray(holidays)) {
            holidays = new Array();
        }

        var holiday_text = "";
        holidays.push({"date":{"day":5,"month":8,"year":c_year},"englishName":"your anniversary"});
        holidays.push({"date":{"day":16,"month":9,"year":c_year},"englishName":"Trevor's birthday"});
        holidays.push({"date":{"day":20,"month":12,"year":c_year},"englishName":"Miranda's birthday"});
        holidays.push({"date":{"day":14,"month":2,"year":c_year},"englishName":"Valentine's day"});
        for (var i = 0; i < holidays.length; i++) {
            var holiday = holidays[i];

            var k = 6 - c_day;

            if (k == 0) {
                k = 1;
            }

            for (var j = 0; j <= k; j++) {
                var today = new Date();
                today.setDate(today.getDate() + j);
                var today_offset = new Date(today);
                var today_offset_month = today_offset.getMonth() + 1;
                var today_offset_date = today_offset.getDate();
                var today_offset_year = today_offset.getFullYear();

                if (holiday.date.day == today_offset_date && holiday.date.month == today_offset_month && holiday.date.year == today_offset_year) {
                    if (j == 0) {
                        holiday_text = "Today is "+holiday.englishName;
                        break;
                    } else if (j == 1) {
                        holiday_text = "Tomorrow is "+holiday.englishName;
                        break;
                    } else {
                        holiday_text = day_names[c_day + j] + " is "+holiday.englishName;
                        break;
                    }
                }
            }
        
        }
        $("#date .holiday").text(holiday_text);
        $('#container').trigger('loadend');
    });
}

function handleGesture(event) {
    if (c_menu_transitioning || $('#loading-screen').is(':visible') || $('#overlay').is(':visible')) return;
    var key = event.keyCode ? event.keyCode : event.which;

    console.log(key);

    $('#overlay').fadeIn();

    switch(key) {
        case 37:
            // left
            overlayLeft();
            break;
        case 39:
            // right
            overlayRight();
            break;
        case 40:
            // down
            showBottom();
            break;
        case 38:
            // up
            showUp();
            break;
        case bla:
            updateLocation();
            break;
    }
}

function overlayLeft() {
    if ($('#overlay').hasClass('right')) {
        $('#overlay').addClass('center');  
    } else {
        $('#overlay').addClass('left');  
    }
}

function overlayRight() {
    if ($('#overlay').hasClass('left')) {
        $('#overlay').addClass('center');  
    } else {
        $('#overlay').addClass('right');  
    }
}

function showLeft() {
    if ($('#viewport').hasClass('right')) {
        // center shown
        c_menu_transitioning = true;
        $('#viewport').addClass('center');
        $('.dock-icon.fa-user').addClass('selected');
        $('.dock-icon.fa-sun-o').removeClass('selected');
    } else {
        // traffic shown
        c_menu_transitioning = true;
        $('#viewport').addClass('left');
        $('.dock-icon.fa-user').removeClass('selected');
        $('.dock-icon.fa-car').removeClass('unselected');
        $('.dock-icon.fa-car').addClass('selected');
    }
;}

var c_eq = 0;
function showRight() {
    if ($('#viewport').hasClass('bottom')) {
        $('#news-content').attr('src', $('.news-list li a').eq(c_eq).attr('href'));
        c_eq++;

    } else if ($('#viewport').hasClass('left')) {
        // center shown
        c_menu_transitioning = true;
        $('#viewport').addClass('center');
        $('.dock-icon.fa-user').addClass('selected');
        $('.dock-icon.fa-car').removeClass('selected');
    } else {
        // weather shown
        c_menu_transitioning = true;
        $('#viewport').addClass('right');
        $('.dock-icon.fa-user').removeClass('selected');
        $('.dock-icon.fa-sun-o').removeClass('unselected');
        $('.dock-icon.fa-sun-o').addClass('selected');
    }
}

function showBottom() {
    if ($('#viewport').hasClass('left') || $('#viewport').hasClass('right')) {
        return;
    } else {
        // news shown
        c_menu_transitioning = true;
        $('#viewport').addClass('bottom');
        $('.dock-icon.fa-user').removeClass('selected');
        $('.dock-icon.fa-newspaper-o').removeClass('unselected');
        $('.dock-icon.fa-newspaper-o').addClass('selected');
    }
}

function showUp() {
    if ($('#viewport').hasClass('bottom')) {
        // center shown
        c_menu_transitioning = true;
        $('#viewport').addClass('center');
        $('.dock-icon.fa-user').addClass('selected');
        $('.dock-icon.fa-newspaper-o').removeClass('selected');
    }
}

function initMap() {
        c_map_initalized = true;
        var head = document.getElementsByTagName('head')[0];

        // Save the original method
        var insertBefore = head.insertBefore;

        // Replace it!
        head.insertBefore = function (newElement, referenceElement) {

            if (newElement.href && newElement.href.indexOf('https://fonts.googleapis.com/css?family=Roboto') === 0) {

                console.info('Prevented Roboto from loading!');
                return;
            }

            if (newElement.tagName.toLowerCase() === 'style'
                && newElement.innerHTML
                && newElement.innerHTML.replace('\r\n', '').indexOf('.gm-style') === 0) {
                return;
            }

            insertBefore.call(head, newElement, referenceElement);
        };
        // Styles a map in night mode.
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: c_lat, lng: c_lng},
          streetViewControl: false,
          zoomControl      : false,
          panControl       : false,
          mapTypeControl : false,
          zoom: 12,
          backgroundColor: 'none',
          styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#000000'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#ffffff'}]},
            {
              featureType: 'administrative',
              elementType: 'labels.text.fill',
              stylers: [{color: '#ffffff'}]
            },
            {
              featureType: 'landscape',
              elementType: 'labels',
              stylers: [{visibility: 'off'}]
            },
            {
              featureType: 'poi',
              stylers: [{visibility: 'off'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#777777'}]
            },
            {
              featureType: 'road.local',
              stylers: [{visibility: 'off'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#ffffff'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels',
              stylers: [{visibility: 'on'}]
            },
            {
              featureType: 'transit',
              stylers: [{visibility: 'off'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels',
              stylers: [{visibility: 'off'}]
            }
          ]
        });
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        google.maps.event.addListenerOnce(map, 'idle', function() {
            $('#overlay').fadeOut();
        });
}

