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
    console.log("newLoations", newLocations)
    getForcastURL(newLocations) //locations array
})

function getForcastURL(locationsArray){  //gets another URL for forecast
    locationsArray.forEach(location =>{
        fetch(`https://api.weather.gov/points/${location[0]},${location[1]}`)
        .then(resp => resp.json())
        .then(jsonObj => {
            getTemperatures(jsonObj.properties.forecast) 
        })
    })
}

function getTemperatures(url){  //gets forecast data for several days
    fetch(url)
    .then(resp => resp.json())
    .then(forecastData => {
        let wednesdayObj = forecastData.properties.periods.filter(tempObj => tempObj.name==="Wednesday")[0] //pulls out weather for upcoming Wednesday
        console.log(wednesdayObj)
        addTempToFile(wednesdayObj.temperature.toString())
    })
}

function addTempToFile(temp){

//  let fileTemps
//  fsLibrary.readFile('temperatures.txt', (error, txt)=>{
//         if(error){throw err}
//         fileTemps = txt.toString() //see if file already has temperatures
//         fileTemps.length === 0? fileTemps = temp : fileTemps += `\n ${temp}`
//         console.log("fileTemps", fileTemps)
//         writeToFile(fileTemps)
//     })
    fsLibrary.appendFile('temperatures.txt', `${temp}\n`, (error) => {   
        if (error) throw error
        console.log("Updated! New temp:", temp) 
     })

}
