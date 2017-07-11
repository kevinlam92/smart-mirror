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
            $("#date .calendar .cal")[i].textContent = d_weekstart.getDate();
            
            if (i == day) {
                $("#date .calendar .cal")[i].className += " today";
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
    updateWeather(pos.coords.latitude, pos.coords.longitude);
}

function updateWeather(lat, lon) {
    $.get("https://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&result_type=locality&latlng="+lat+","+lon+"&key="+mapsKey,
    function(data) {
        var city = data.results[0].address_components[0].short_name;
        $('#weather .city').text(city);
    });

    $.get("https://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&result_type=locality&latlng="+lat+","+lon+"&key="+mapsKey,
    function(data) {
        var city = data.results[0].address_components[0].short_name;
        $('#weather .city').text(city);
    });

    $.get("https://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&result_type=administrative_area_level_1&latlng="+lat+","+lon+"&key="+mapsKey,
    function(data) {
        var area = data.results[0].address_components[0].short_name;
        $('#weather .area').text(area);
    });

    $.get("http://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&appid="+weatherKey,
    function(data) {
        var temp = Math.round(data.main.temp - 273.15);
        $("#weather .temp").text(temp);
        $("#weather .text").text(data.weather[0].description);
        var html;
        var id = data.weather[0].id;
        switch(id) {
            case 800:
                html = '<div class="icon sunny"><div class="sun"><div class="rays"></div></div></div>';
                break;
            case 511:
            case 520:
            case 521:
            case 522:
            case 531:
                html = '<div class="icon rainy"><div class="cloud"></div><div class="rain"></div></div>';
                break;
            case 500:
            case 501:
            case 502:
            case 503:
            case 504:
                html = '<div class="icon sun-shower"><div class="cloud"></div><div class="sun"><div class="rays"></div></div><div class="rain"></div></div>';
                break;
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
                html = '<div class="icon thunder-storm"><div class="cloud"></div><div class="lightning"><div class="bolt"></div><div class="bolt"></div></div></div>'
                break;
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
                html = '<div class="icon flurries"><div class="cloud"></div><div class="snow"><div class="flake"></div><div class="flake"></div></div></div>';
                break;
            default:
                html = '<div class="icon cloudy"><div class="cloud"></div><div class="cloud"></div></div>';
                break;
        }
        $('.icon-container').html(html);
    });

    $.get("https://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&result_type=country&latlng="+lat+","+lon+"&key="+mapsKey,
    function(data) {
        var month = c_month + 1;
        var country = data.results[0].address_components[0].short_name;
        switch(country) {
            case 'CA':
                country = 'can';
                break;
            case 'US':
                country = 'usa';
                break;
        }

        var month = c_month + 1;

        $.get("http://kayaposoft.com/enrico/json/v1.0/index.php?action=getPublicHolidaysForMonth&month="+month+"&year="+c_year+"&country=can&region=british-columbia", function(holidays) {

            var holiday_text = "";
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
        });
    });

}
