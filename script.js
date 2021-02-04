window.addEventListener('load', () => {
    let long = -118.243683;
    let lat = 34.052235;
    let location = document.querySelector('.location');
    let weatherSummary = document.querySelector('.weather-summary');
    let weatherTemperature = document.querySelector('.temperature');
    let weatherAlert = document.querySelector(".weather-alert");
    let weatherHourlyTime = document.querySelectorAll(".weather-hourly-time");
    let weatherHourlyIcon = document.querySelectorAll(".weather-hourly-icon");
    let weatherHourlyTemperature = document.querySelectorAll(".weather-hourly-temperature");
    let weatherDailyDay = document.querySelectorAll(".weather-daily-day");
    let weatherDailyIcon = document.querySelectorAll(".weather-daily-icon");
    let weatherDailyHi = document.querySelectorAll(".weather-daily-hi-temperature");
    let weatherDailyLo = document.querySelectorAll(".weather-daily-lo-temperature");

    let locationSearchCity = document.querySelector(".location-search-city");
    let locationSearchSubmit = document.querySelector(".location-search-submit");
    let locationSearchMyLocation = document.querySelector(".location-search-my-location");

	let api;
	let dataFromAPI;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            long = position.coords.longitude;
            lat = position.coords.latitude;
			render(long, lat, null)
        })
    }
	
	render(long, lat, null)
	
	weatherTemperature.addEventListener('click', () => updateTemperatureUnit(dataFromAPI));
			
	locationSearchSubmit.addEventListener('click', () => displaySearchCity());
			
	locationSearchMyLocation.addEventListener('click', () => displayMyLocationWeather());
	
	locationSearchCity.addEventListener("keyup", function(event){
		if(event.keyCode === 13){
			locationSearchSubmit.click();
		}
	})
	
	function render(long, lat, city){
		api = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&&exclude=minutely&appid=ecf3bcaacd721741ea58571e6fdda2ea`;
		fetch(api)
		    .then(response => {
		        return response.json();
		    })
		    .then(data => {
		        // rendering currently information
				dataFromAPI = data;
		        renderCurrentWeather(data, city);
		
		        const today = new Date();
		        //  rendering hourly information
		        renderHourlyWeather(data, today);
		
		        // rendering daily information
		        renderDailyWeather(data, today);
		    })
	}

    function renderCurrentWeather(data, city) {
        const {
            temp,
            weather,
        } = data.current;

        const alert = data.alerts;
        let alertInfo = "";
        if (alert) {
            for (let i = 0; i < alert.length; i++)
                alertInfo += alert[i].title + "\n";
        }

        weatherTemperature.textContent = kToF(temp) + "\u00B0F";
        weatherSummary.textContent = weather[0].main;
		if(city === null){
			location.textContent = data.timezone.split("/")[1].replace("_", " ");
		}else{
			location.textContent = city;
		}
        weatherAlert.innerText = alertInfo;
    }

    function renderHourlyWeather(data, time) {
        const hourlyData = data.hourly;
        const currentHour = time.getHours();

        for (let i = 0; i < 23; i++) {
            if (i === 0) {
                weatherHourlyTime[i].textContent = "Now";
            } else {
                const hour = (currentHour + i) % 24;
                weatherHourlyTime[i].textContent = hour < 10 ? "0" + hour : hour;
            }
            weatherHourlyTemperature[i].textContent = kToF(hourlyData[i].temp) + "\u00B0";
            setIcons(hourlyData[i].weather[0].icon, weatherHourlyIcon[i]);
        }
    }

    function renderDailyWeather(data, time) {
        const dailyData = data.daily;
        const currentDay = time.getDay();
        const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        for (let i = 0; i < 7; i++) {
            weatherDailyDay[i].textContent = weekday[(currentDay + i) % 7];
            weatherDailyHi[i].textContent = kToF(dailyData[i].temp.max) + "\u00B0";
            weatherDailyLo[i].textContent = kToF(dailyData[i].temp.min) + "\u00B0";
            setIcons(dailyData[i].weather[0].icon, weatherDailyIcon[i]);
        }
    }

    function displaySearchCity() {
        const zipcode = locationSearchCity.value;
        api = `https://app.zipcodebase.com/api/v1/search?apikey=26436530-6642-11eb-b787-4d04f7ef9ea4&codes=${zipcode}&country=US`;
		console.log(api);

        fetch(api)
            .then(response => {
                return response.json();
            })
			.then(data => {
				const {longitude, latitude, city, state_code} = data.results[zipcode][0];
				render(longitude, latitude, `${city}, ${state_code}`);
			})
    }

    function displayMyLocationWeather() {
        navigator.geolocation.getCurrentPosition(position => {
            long = position.coords.longitude;
            lat = position.coords.latitude;
			render(long, lat, null);
        })
    }


    let iconIDAdapter = {
        "01d": "CLEAR_DAY",
        "01n": "CLEAR_NIGHT",
        "02d": "PARTLY_CLOUDY_DAY",
        "02n": "PARTLY_CLOUDY_NIGHT",
        "03d": "CLOUDY",
        "03n": "CLOUDY",
        "04d": "CLOUDY",
        "04n": "CLOUDY",
        "09d": "RAIN",
        "09n": "RAIN",
        "10d": "SLEET",
        "10n": "SLEET",
        "11d": "RAIN",
        "11n": "RAIN",
        "13d": "SNOW",
        "13n": "SNOW",
        "50d": "FOG",
        "50n": "FOG"
    };

    function setIcons(icon, iconID) {
        const skycons = new Skycons({
            color: "white"
        });
        const currentIcon = iconIDAdapter[icon];
        skycons.play();
        return skycons.set(iconID, Skycons[currentIcon]);
    }

    function updateTemperatureUnit(data) {
        const hourlyData = data.hourly;
        const dailyData = data.daily;
        const temperature = data.current.temp;

        if (weatherTemperature.textContent.endsWith('F')) {
            weatherTemperature.textContent = kToC(temperature) + "\u00B0C";

            for (let i = 0; i < 23; i++) {
                weatherHourlyTemperature[i].textContent = kToC(hourlyData[i].temp) + "\u00B0";
            }
            for (let i = 0; i < 7; i++) {
                weatherDailyHi[i].textContent = kToC(dailyData[i].temp.max) + "\u00B0";
                weatherDailyLo[i].textContent = kToC(dailyData[i].temp.min) + "\u00B0";
            }
        } else {
            weatherTemperature.textContent = kToF(temperature) + "\u00B0F";

            for (let i = 0; i < 23; i++) {
                weatherHourlyTemperature[i].textContent = kToF(hourlyData[i].temp) + "\u00B0";
            }
            for (let i = 0; i < 7; i++) {
                weatherDailyHi[i].textContent = kToF(dailyData[i].temp.max) + "\u00B0";
                weatherDailyLo[i].textContent = kToF(dailyData[i].temp.min) + "\u00B0";
            }
        }
    }
	
	function kToF(k) {
	    return Math.floor(1.8 * (k - 273) + 32);
	}
	
	function kToC(k) {
	    return Math.floor(k - 273.15);
	}


})