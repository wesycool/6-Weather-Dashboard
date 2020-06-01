const key = '2d16edaf814c74f9e0898876fc6cc68f'
const search = 'Toronto'
let unit = 'metric'
let geolocation = localStorage.geolocation;
let searchlist = (localStorage.searchlist)? JSON.parse(localStorage.searchlist) : [];

startup()

//At Start
function startup(){
    loadData(search,unit,null,false);
    if (geolocation) loadData(search,unit,JSON.parse(geolocation),false);
    else geoLocation();
}

//Get Geo Location
function geoLocation(){
    navigator.geolocation.getCurrentPosition(async function(position){ 
        loadData(search,unit,position.coords,false);
        localStorage.geolocation = JSON.stringify({latitude:position.coords.latitude,longitude:position.coords.longitude})
    });
}

//Fetch and Load Data
async function loadData(search,unit,geo,isSearch){
    const parameters = (geo != null)? `lat=${geo.latitude}&lon=${geo.longitude}`: `q=${search}`;
    const currentFetch = await fetch(`https://api.openweathermap.org/data/2.5/weather?${parameters}&units=${unit}&appid=${key}`)
    
    currentFetch.text().then(function(data){
        const getData = JSON.parse(data)
        const icon = `http://openweathermap.org/img/wn/${getData.weather[0].icon}.png`
        const getCity = `${getData.name}, ${getData.sys.country}`
        
        if (isSearch){
            if (searchlist.includes(getCity)) searchlist.splice(searchlist.indexOf(getCity),1);
            searchlist.push(getCity);
            localStorage.searchlist = JSON.stringify(searchlist)
        } 
        

        document.querySelector('#name').innerHTML = `<span id='city'>${getData.name}</span> (${moment(getData.dt,'X').format('L')}) <img src='${icon}'>`;
        document.querySelector('#temp').innerHTML = `Temperature: ${getData.main.temp.toFixed(1)}\xB0${(unit=='metric')? 'C': 'F'}` ;
        document.querySelector('#humidity').innerHTML = `Humidity: ${getData.main.humidity}%`
        document.querySelector('#windSpeed').innerHTML = `Wind Speed: ${getData.wind.speed} ${(unit=='metric')? 'm/s': 'mph'}`
       
        getForecast(getData.coord.lat,getData.coord.lon)
        searchList()
    })
}


//Get Forecast
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


//Change Unit Metric/Imperial
function changeUnit(){
    unit = event.target.id
    loadData(document.querySelector('#city').textContent,unit,)
    
    $(document).ready(function(){
        $().button('toggle')
        $().button('dispose')
    })
}

//At Search Button
function searchCity() {
    event.preventDefault();
    const searchCity = document.querySelector('#search');
    loadData(searchCity.value,unit,null,true);
    searchCity.value = '';
}

//Historical Search List
function searchList() {
    const searchListHTML = document.querySelector('#searchListID')
    searchListHTML.innerHTML =''
    for (const city of searchlist){
        searchListHTML.innerHTML = `<li class="list-group-item"><a href="#" onclick="onClickList()" >${city}</a></li> ` + searchListHTML.innerHTML ;
    }
}

//At Historical Search List
function onClickList(){
    loadData(event.target.textContent,unit,null,true)
}