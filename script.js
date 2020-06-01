const key = '2d16edaf814c74f9e0898876fc6cc68f'
const search = 'Toronto'
let unit = 'metric'
let country;
let geolocation = localStorage.geolocation;

startup()

function startup(){
    loadData(search,unit,);
    if (geolocation) loadData(search,unit,JSON.parse(geolocation));
    else geoLocation();
}


function geoLocation(){
    navigator.geolocation.getCurrentPosition(async function(position){ 
        loadData(search,unit,position.coords);
        localStorage.geolocation = JSON.stringify({latitude:position.coords.latitude,longitude:position.coords.longitude})
    });
}


async function loadData(search,unit,geo){
    const parameters = (geo != null)? `lat=${geo.latitude}&lon=${geo.longitude}`: `q=${search}`;
    const currentFetch = await fetch(`https://api.openweathermap.org/data/2.5/weather?${parameters}&units=${unit}&appid=${key}`)

    currentFetch.text().then(function(data){
        const getData = JSON.parse(data)
        const icon = `http://openweathermap.org/img/wn/${getData.weather[0].icon}.png`
        country = getData.sys.country

        document.querySelector('#name').innerHTML = `<span id='city'>${getData.name}</span> (${moment(getData.dt,'X').format('L')}) <img src='${icon}'>`;
        document.querySelector('#temp').innerHTML = `Temperature: ${getData.main.temp.toFixed(1)}\xB0${(unit=='metric')? 'C': 'F'}` ;
        document.querySelector('#humidity').innerHTML = `Humidity: ${getData.main.humidity}%`
        document.querySelector('#windSpeed').innerHTML = `Wind Speed: ${getData.wind.speed} ${(unit=='metric')? 'm/s': 'mph'}`
       
        
        getForecast(getData.coord.lat,getData.coord.lon)
    })
}


async function getForecast(lat,lon){
    const forecastFetch = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${unit}&exclude=minutely,hourly&appid=${key}`);

    forecastFetch.text().then(function(data){
        const getData = JSON.parse(data).daily

        document.querySelector('#uvIndex').innerHTML = `UV Index: ${getData[0].uvi}`;
        document.querySelector('#forecast').innerHTML = '';
        
        for (const index in getData){
            if(![0,6,7].includes(Number(index))){
                document.querySelector('#forecast').innerHTML += `
                <div class='col'>
                    <div class="card mb-3">
                        <div class="card-header bg-transparent">${moment(getData[index].dt,'X').format('L')}</div>
                        <div class="card-body">
                            <img src='http://openweathermap.org/img/wn/${getData[index].weather[0].icon}.png'>
                            <p>Temperature: ${getData[index].temp.day.toFixed(1)}\xB0${(unit=='metric')? 'C': 'F'}</p>
                            <p>Humidity: ${getData[index].humidity}%</p>
                        </div>
                    </div>
                </div>`;
            }
        }
    })
}


function changeUnit(){
    unit = event.target.id
    loadData(document.querySelector('#city').textContent,unit,)
    
    $(document).ready(function(){
        $().button('toggle')
        $().button('dispose')
    })
}

function searchCity() {
    event.preventDefault();
    const searchCity = document.querySelector('#search');
    loadData(searchCity.value,unit,);
    searchCity.value = '';
}