document.addEventListener('DOMContentLoaded', async function() {

    let location = await GetCurrentLocation();
    await GetAndDisplayWeatherData(location);

    //button for forecast
    let getForecastBtn = document.getElementById('getForecastBtn');
    getForecastBtn.addEventListener('click', async()=>{

        let location = document.getElementById('inputLocation').value;
        
        if(location === "")
        {
            location = await GetCurrentLocation();
        } else {
            location = await GetLocationCorrectedName(location);
        }

        await GetAndDisplayWeatherData(location);
    });
});

async function GetCurrentLocation(){
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const location = await GetCityName(latitude, longitude);
                resolve(location);
            }, (error) => {
                console.error("Error getting geolocation:", error.message);
                reject(error);
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

async function GetAndDisplayWeatherData(location){

    const response = await fetch(
        `http://api.weatherapi.com/v1/forecast.json?key=7f4aa353a2734cc6be7214157242303&q=${location}&lang=pt&days=3`
    )
    if(response.status === 400)
    {
        alert("error occorred!")
        //show error message
    } else {
        const data = await response.json(); // Parse JSON response
        console.log(data);
        document.getElementById('temperature').innerHTML = data.forecast.forecastday[0].day.avgtemp_c + "º";

        document.getElementById('humidity').innerHTML = "Humidade: " + data.forecast.forecastday[0].day.avghumidity + "%";

        document.getElementById('rainProbability').innerHTML = "Chuva: " + data.forecast.forecastday[0].day.daily_chance_of_rain + "%";

        document.getElementById('description').innerHTML = data.current.condition.text;

        fillWeatherBoxes(data);
    }
}

async function GetCityName(latitude, longitude) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    const data = await response.json();

    const currentDate = new Date();

    let location = ""

    if(document.getElementById('inputLocation').value != "")
    {
        let propertyName = findPropertyByValue(data.address, document.getElementById('inputLocation').value);

        location = data.address[propertyName] + " - " + data.address.country;
    } else {
        location = data.address.city + " - " + data.address.country;
    }

    console.log(data);

    document.getElementById('location').innerHTML = location + ` <em>(${currentDate.toDateString()})</em>`;

    return location;
}

function findPropertyByValue(obj, value) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop) && obj[prop].toLowerCase().includes(value.toLowerCase())) {
            return prop;
        }
    }

    return null;
}

async function GetLocationCorrectedName(location){
    const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=534da3c00ee4377cfa7a9a25fccdde61`
    )

    const data = await response.json();

    const { lat, lon } = data[0];

    return GetCityName(lat, lon);
}

function fillWeatherBoxes(data){
    let daysForecast = data.forecast.forecastday;
    console.log(daysForecast)

    for(let i = 1; i < daysForecast.length; i++){

        document.getElementById(`dayOfWeek${i}`).innerHTML = getDayOfWeek(daysForecast[i].date) + `<em> (${daysForecast[i].date})</em>`;
        document.getElementById(`temperatureBox${i}`).innerHTML = daysForecast[i].day.avgtemp_c + "º";
        document.getElementById(`humidity${i}`).innerHTML = "Humidade: " + daysForecast[i].day.avghumidity + "%";
        document.getElementById(`rainProbability${i}`).innerHTML = "Chuva: " + daysForecast[i].day.daily_chance_of_rain + "%";
    }
}

function getDayOfWeek(dateReceived){
    const date = new Date(dateReceived);
    const dayOfWeek = date.getDay();
    const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    return daysOfWeek[dayOfWeek];
}