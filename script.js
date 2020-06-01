const key = '2d16edaf814c74f9e0898876fc6cc68f'
const search = 'Toronto'
const unit = 'metric'


async function loadData(search,unit){
    const currentFetch = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${search}&units=${unit}&appid=${key}`)

    currentFetch.text().then(function(data){
        const getData = JSON.parse(data)
        const icon = `http://openweathermap.org/img/wn/${getData.weather[0].icon}.png`

        document.querySelector('#name').innerHTML = `${getData.name} (${moment(getData.dt,'X').format('L')}) <img src='${icon}'>`;
        document.querySelector('#temp').innerHTML = `Temperature: ${getData.main.temp}\xB0${(unit=='metric')? 'C': 'F'}` ;
        document.querySelector('#humidity').innerHTML = `Humidity: ${getData.main.humidity}%`
        document.querySelector('#windSpeed').innerHTML = `Wind Speed: ${getData.wind.speed} ${(unit=='metric')? 'm/s': 'mph'}`
        
        getForecast(getData.coord.lat,getData.coord.lon)
    })
}

async function getForecast(lat,lon){
    const forecastFetch = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${unit}&exclude=minutely,hourly&appid=${key}`);

    forecastFetch.text().then(function(data){
        const getData = JSON.parse(data).daily

        console.log(getData)
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
                                <p>Temperature: ${getData[index].temp.day}\xB0${(unit=='metric')? 'C': 'F'}</p>
                                <p>Humidity: ${getData[index].humidity}%</p>
                            </div>
                        </div>
                    </div>`;
            }
        }

        
    })
}


loadData(search,unit)