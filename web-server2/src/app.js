const path = require('path')
const express = require('express')
const hbs = require('hbs')
const geocode = require('./utils/geocode')
const forecast = require('./utils/forecast')

const app = express()
const port = process.env.PORT || 3000
//directory name
//console.log(__dirname)
//filename
//console.log(path.join(__dirname, '../public'))
//path.join(__dirname, '../..') (a '..'-tal lehet manipulálni és visszaugrálni a mappákban)
//telülírja amit alatta írnál és csak az index.html-re hagyatkozik
// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')
//#region 
/*
//kibackeltük az index.html-el
//ezzel setuppoljuk a servert, 2 argomentum kell neki inc request (req) és response (res)  
app.get('', (req, res)=> {
    //mit akarunk vele csinálni? visszaküldenki egy üzenetet
    res.send('<h1>Weather</h1>')
})
*/
//#endregion
//Define paths for express config
//name(view space engine) and value(hbs what we installed)
//setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)
// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

//csinálunk egy vonatkozást az index.hbs-re viszont nem kell kiterjesztést írni csak a név feleljen meg (dinamikus)
app.get('', (req, res) => {
    res.render('index', {
        title: 'Weather App',
        name: 'Benyo'
    })
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Me',
        name: 'Benyo'
    })
})

app.get('/help', (req, res) => {
    res.render('help', {
        helpText: 'This is a help text',
        title: 'Help',
        name: 'Benyo'
        
    })
})

app.get('/weather', (req, res) => {
     //ha nincs az address-nél megadva érték akkor a következőt addjuk vissza a weboldalnak
    if (!req.query.address) {
         //return kell hogy ne crasheljen ki
        return res.send({
            //errorüzenet amit látunk a frontenden
            error: 'You must provide an address!'
        })
    }
    geocode(req.query.address, (error, { latitude, longitude, location } = {}) => {
        if (error) {
            return res.send({ error })
        }
        forecast(latitude, longitude, (error, forecastData) => {
            if (error) {
                return res.send({ error })
            }
            //ha van érték az address-nél akkor visszaadjuk a weboldalnak az értéket            
            res.send({
                forecast: forecastData,
                location,
                //visszaadjuk egy json-ben a helyet amire rákerestünk
                address: req.query.address
            })
        })
    })
})

app.get('/products', (req, res) => {
    if (!req.query.search) {
        return res.send({
            error: 'You must provide a search term'
        })
    }

    console.log(req.query.search)
    res.send({
        products: []
    })
})

app.get('/help/*', (req, res) => {
    res.render('404', {
        title: '404',
        name: 'Benyo',
        errorMessage: 'Help article not found.'
    })
})

//utolsónak kell lennnie
app.get('*', (req, res) => {
    res.render('404', {
        title: '404',
        name: 'Benyo',
        errorMessage: 'Page not found.'
    })
})
//start the server up on port 3000
app.listen(port, () => {
    console.log('Server is up on port '+ port + '.')
})