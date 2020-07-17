const fsLibrary  = require('fs') 
const fetch = require("node-fetch")

fsLibrary.readFile('locations.txt', (error, txt) => {
    if (error) throw error;
    let locations = txt.toString().split("\n") //turn each line into array element
    let newLocations = locations.map(locationString =>{  //turn each element into array of latitude and longitude
        let locationArray = locationString.split(",")
        let splitLat = locationArray[0].split("° ")
        let splitLong = locationArray[1].split("° ")
        let lat, long
        splitLat[1]==="S" ? lat = splitLat[0]*(-1) : lat = splitLat[0]
        splitLong[1]==="W" ? long = splitLong[0]*(-1) : long = splitLong[0]
        
        return [lat,long]
    })

    getForcastURL(newLocations) //locations array
})

function getForcastURL(locationsArray){  //gets another URL for forecast
    locationsArray.forEach(location =>{
        fetch(`https://api.weather.gov/points/${location[0]},${location[1]}`)
        .then(resp => resp.json())
        .then(jsonObj => {
            getTemperatures(jsonObj.properties.forecast) //passes to function that makes another fetch call
        })
    })
}

function getTemperatures(url){  //gets forecast data for several days
    fetch(url)
    .then(resp => resp.json())
    .then(forecastData => {
        let wednesdayObj = forecastData.properties.periods.filter(tempObj => tempObj.name==="Wednesday")[0] //pulls out weather for upcoming Wednesday
        addTempToFile(wednesdayObj.temperature.toString())
    })
}

function addTempToFile(temp){
    fsLibrary.appendFile('temperatures.txt', `${temp}\n`, (error) => {   
        if (error) throw error
        console.log("Updated! New temp:", temp) 
     })
}
