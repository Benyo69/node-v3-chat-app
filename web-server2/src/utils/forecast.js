const request = require("postman-request")

const forecast = ((latitude, longitude, callback)=>{
    const url = 'http://api.weatherstack.com/current?access_key=3092b442eaec0f07ca3bfd5c7ee0a13f&query='+ latitude + ',' + longitude + '&units=m'
    //használhatjuk a shorthand syntaxot ahol nem kell ismételten hivatkozni az url-re mint url
    request({ url, json:true}, (error, {body} = {}) =>{
        if(error){
            callback('Unable to connect to sever', undefined)
        }else if(body.error){
            callback('Invalid parameters',undefined)
        }else{
            callback(undefined,body.current.weather_descriptions[0] + '. It is currently ' + body.current.temperature + ' degrees out. It feels like ' + body.current.feelslike + ' out. The humidity is currently: '+ body.current.humidity+'%')
        }
    })
    
})



module.exports = forecast