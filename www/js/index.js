/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

var currencyLocal = "";
var country = "";
var city = "";
var town = "";
var visited = "";
var image;
var rate = 1;

// ----------- VIBRATION

function shake() {
    navigator.vibrate(3000);
}

// ----------- ACCELEROMETER

function accCallback(acceleration) {
    var element = document.getElementById('accelerometer');

    element.innerHTML = 'Acceleration X: ' + acceleration.x + '<br>' +
        'Acceleration Y: ' + acceleration.y + '<br>' +
        'Acceleration Z: ' + acceleration.z + '<br>' +
        'Timestamp: ' + acceleration.timestamp + '<br>';

}

// NOTE THAT THIS IS THE SAME ON ERROR CALLBACK FUNCTION
// THAT WE'RE USING FOR ALL OTHER FUNCTIONS
function onError(message) {
    console.log(message);
}

var options = {
    frequency: 3000
};

var watchID = null;

function startWatch() {
    watchID = navigator.accelerometer.watchAcceleration(accCallback, onError, options);
}

// ----------- PICTURES

function pics() {
    navigator.camera.getPicture(cameraCallback, onError);
    //navigator.camera.getPicture( cameraSuccess, cameraError, [ cameraOptions ] );
}

function cameraCallback(imageData) {
    image = document.getElementById('myImage');
    //image.src = "data:image/jpeg;base64," + imageData;
    image.src = imageData;
    
   
}
getLocation();

// ----------- GEOLOCATION

function getLocation() {
    console.log("Get Location Called 1");
    navigator.geolocation.getCurrentPosition(geoCallback, onError);
}

var lat;
var lng;

function geoCallback(position) {

    console.log("geoCallback 2");
    console.log(position);
    lat = position.coords.latitude;
    lng = position.coords.longitude

    // RIGHT AFTER WE'VE GOT THE READING FROM THE GPS SENSOR
    // WE'RE CALLING THE OPENCAGE API WITH THE DATA COLLATED
    opencageapi(lat, lng);

    var loc = 'Latitude: ' + position.coords.latitude + '<br>' +
        'Longitude: ' + position.coords.longitude + '<br>' +
        'Altitude: ' + position.coords.altitude + '<br>' +
        'Accuracy: ' + position.coords.accuracy + '<br>' +
        'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br>' +
        'Heading: ' + position.coords.heading + '<br>' +
        'Speed: ' + position.coords.speed + '<br>' +
        'Timestamp: ' + position.timestamp + '<br>';

    //output location data
    //document.getElementById('location').innerHTML = loc;

    //call map coords delay 2 seconds
    setTimeout(function () {
        initMap(lat,lng);
    }, 2000);
   

    //call weather api passing coords  
    weatherapi(lat, lng);

    // 2 second delay read of variables to allow opencage location variables to be picked up and stored
    setTimeout(function () {
        conversion();
    }, 2000);



};


//call getLocation to initiate coords & opencage
getLocation();

// ----------- GOOGLE MAPS API


// THIS IS A NEW MAP USING THE LOCATION FROM THE GPS SENSOR
function initMap(lat, lng) {
    var pos = {
        lat: lat,
        lng: lng
    };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 18,
        center: pos
    });
    var marker = new google.maps.Marker({
        position: pos,
        map: map
    });

}

//show or hide elements
//$("#map").hide();
//$("#map").show();
//$("#file").hide();




// ----------- OPENCAGE API

function opencageapi(lat, lng) {

    console.log("opencage 3");

    var http = new XMLHttpRequest();
    const opencage = 'https://api.opencagedata.com/geocode/v1/json?q=' + lat + '+' + lng + '&key=22e5695431c543d682e4d4b52ec743ab';
    http.open("GET", opencage);
    http.send();

    http.onreadystatechange = (e) => {
        var response = http.responseText
        var responseJSON = JSON.parse(response);
        console.log(responseJSON);

        country = responseJSON.results[0].components.country;
        console.log(country);

        city = responseJSON.results[0].components.city;
        console.log(city);

        town = responseJSON.results[0].components.town;
        console.log(town);

        currency = responseJSON.results[0].annotations.currency.iso_code;
        //capture local currency to global variable
        currencyLocal = currency;
        console.log(currencyLocal);
        //if city is undefined display Town
        if (city != undefined) {
            document.getElementById("welcome").innerHTML = "Welcome to " + city + " - " + country;
        } else {
            document.getElementById("welcome").innerHTML = "Welcome to " + town + " - " + country;
        }

        document.getElementById("localcurrency").innerHTML = "Local Currency is: " + currencyLocal;

        
        
    }
    return currencyLocal;
    

}

 

// ---------- CURRENCY CONVERSION RATES



function conversion() {
    //US Dollar String Variable
    var currencyDollar = "USD";
    //Concatenate Strings to produce Local Currency Input to Quotes Array e.g. (USDSTR) or (USDEUR)
    var currencyConc = currencyDollar.concat(currencyLocal);
    console.log(currencyConc);

    //console.log("conversion called 4");
    //using jquery query the apilayer API and retrieve the currency data
    $.getJSON("http://www.apilayer.net/api/live?access_key=2460d56dd4475d384807c7a7844c1281", function (data) {

        var quotesForView = "";
        var quotes = data.quotes;
        var keys = Object.keys(quotes);
        var convrate = 1;



        //iterate through elements to find USD(Local) exchange rate
        keys.forEach((element) => {
            quotesForView += "1 USD is equivalent to " + quotes[element] + " " + element + "<br>";

            //find USD(Local Currency) rate and assign to global variable
            if (element == currencyConc) {
                convrate = quotes[element];
                rate = convrate;
                console.log(rate);
                //console.log(quotes[element]);

            }
            return rate;

        });

        //write the intro and title to screen
        document.getElementById('title').innerHTML = "**** Dollar <===> Local Currency Converter ****<br><br>";
        document.getElementById('intro').innerHTML = "Enter Dollar or Local Currency Amount to Convert: <br><br>";
        // document.getElementById('status').innerHTML = quotesForView;
        //console.log(keys);

    });
}

//conversion();

//rate = convrate;
console.log(rate);

function convert(rate) {
    var in_amtDollar, inAmtLocal, local, dollar;
    //take in local rate from API
    this.rate = rate;
    // take in Dollar Conversion Value
    in_amtDollar = document.getElementById("inAmtDollar").value;
    //take in local conversion value
    in_amtLocal = document.getElementById("inAmtLocal").value;




    //euro conversion
    local = in_amtDollar * rate;
    //dollar conversion
    dollar = in_amtLocal / rate;

    //output entered currencies and rate to screen
    document.getElementById("enteredLocal").innerHTML = "Amount Entered Local: " + in_amtLocal + "<br>";
    document.getElementById("enteredDollar").innerHTML = "Amount Entered Dollar: " + in_amtDollar + "<br>";
    document.getElementById("rate").innerHTML = "Current Rate: " + rate + "<br>";
    //output conversions to screen
    document.getElementById("convertedLocal").innerHTML = " Local # " + local.toFixed(2);
    document.getElementById("convertedDollar").innerHTML = " Dollar $ " + dollar.toFixed(2);
    document.getElementById("inAmtLocal").value = local.toFixed(2);
    document.getElementById("inAmtDollar").value = dollar.toFixed(2);
};

//reset the values entered
function reset() {
    document.getElementById("form1").reset();
    document.getElementById("enteredLocal").innerHTML = "";
    document.getElementById("enteredDollar").innerHTML = "";
    document.getElementById("rate").innerHTML = "";
    document.getElementById("convertedLocal").innerHTML = "";
    document.getElementById("convertedDollar").innerHTML = "";
}


// ----------- WEATHER API

//Using JQuery to retreive the JSON data from weather API Apixu
function weatherapi(lat, lng) {
    $.getJSON("http://api.apixu.com/v1/current.json?key=522079c85fee417f922184437182811&q=" + lat + ', ' + lng + "", function (data) {
        console.log(data);

        //Declare & set variables  for temperature, FeelsLike temperature, Weather Text, & Icon img        
        var celsius = data.current.temp_c;
        var feelcel = data.current.feelslike_c;
        var cond = data.current.condition.text;
        var icon = data.current.condition.icon;

        //Display temperature in celsius
        $("#temp").text(celsius + "°C & Feels like " + feelcel + "°C");
        //Output condition text & icon
        $("#condtext").text(cond);
        $("#cond").attr("src", icon);



    });


}

//call FileWrite delay 3 seconds
 setTimeout(function () {
     tryingFile();
 }, 5000);

// document.addEventListener("deviceready", function() { 
//    tryingFile();
//   }, false);


// ----------- SAVING FILES (READING AND WRITING)

function tryingFile() {

    // Displaying on console
    console.log(cordova.file);

    // Displaying on front end
    
    visited += " You have Visited: " + country + "<br>";
    visited += " City Visited: " + city + "<br>";"<br>";
    visited += " Town Visited: " + town + "<br>";"<br>";
    visited += " Local Currency: " + currencyLocal + "<br>";
    visited += " Rate Local: " + rate;
    
    
   
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

        // Displaying result in the console
        console.log('file system open: ' + fs.name);

        // Displaying in front end
        var toFrontEnd = 'file system open: ' + fs.name;
       // document.getElementById('filefront').innerHTML = toFrontEnd;

        // Name of the file I want to create
        var fileToCreate = "travel.txt";

        // Opening/creating the file
        fs.root.getFile(fileToCreate, {
            create: true,
            exclusive: false
        }, function (fileEntry) {

            // Display in the console
            console.log("fileEntry is file?" + fileEntry.isFile.toString());

            // Displaying in front end
          //  var toFrontEnd = document.getElementById('file').innerHTML;
            //toFrontEnd += "fileEntry is file?" + fileEntry.isFile.toString();
          //  document.getElementById('file').innerHTML = toFrontEnd;

            var dataObj = new Blob([visited], {
                type: 'text/plain'
            });
            // Now decide what to do
            // Write to the file
           //writeFile(fileEntry, dataObj);

            // Or read the file
            //readFile(fileEntry);

        }, onError);

    }, onError);

}

function tryWriteFile() {

    // Displaying on console
    console.log(cordova.file);   
    
   
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

        // Displaying result in the console
        console.log('file system open: ' + fs.name);

        // Displaying in front end
        var toFrontEnd = 'file system open: ' + fs.name;
       document.getElementById('filewritep').innerHTML = toFrontEnd;

        // Name of the file I want to create
        var fileToCreate = "travel.txt";

        // Opening/creating the file
        fs.root.getFile(fileToCreate, {
            create: true,
            exclusive: false
        }, function (fileEntry) {

            // Display in the console
            console.log("fileEntry is file?" + fileEntry.isFile.toString());

            // Displaying in front end
          var toFrontEnd = document.getElementById('filewritep').innerHTML;
            toFrontEnd += "fileEntry is file?" + fileEntry.isFile.toString();
            toFrontEnd += "+<br> File: travel.txt written successfully!";
          document.getElementById('filewritep').innerHTML = toFrontEnd;

            //visited object passed to dataObj   
            var dataObj = new Blob([visited], {
                type: 'text/plain'
            });
            // Now decide what to do
            // Write to the file
           writeFile(fileEntry, dataObj);

            // Or read the file
            //readFile(fileEntry);

        }, onError);

    }, onError);

}


function tryReadFile() {

    // Displaying on console
    console.log(cordova.file);   
    
   
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

        // Displaying result in the console
        console.log('file system open: ' + fs.name);

        // Displaying in front end
        /* var toFrontEnd = 'file system open: ' + fs.name;
       document.getElementById('filewrite').innerHTML = toFrontEnd; */

        // Name of the file I want to create
        var fileToCreate = "travel.txt";

        // Opening/creating the file
        fs.root.getFile(fileToCreate, {
            create: true,
            exclusive: false
        }, function (fileEntry) {

            // Display in the console
            //console.log("fileEntry is file?" + fileEntry.isFile.toString());

            // Displaying in front end
          /* var toFrontEnd = document.getElementById('filewrite').innerHTML;
            toFrontEnd += "fileEntry is file?" + fileEntry.isFile.toString();
          document.getElementById('filewrite').innerHTML = toFrontEnd;

            var dataObj = new Blob([visited], {
                type: 'text/plain'
            }); */
            // Now decide what to do
            // Write to the file
           //writeFile(fileEntry, dataObj);

            // Or read the file
            readFile(fileEntry);

        }, onError);

    }, onError);

}




// Let's write some files
function writeFile(fileEntry, dataObj) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function () {
            console.log("Successful file write...");
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['Object not passed in - Blob created'], {
                type: 'text/plain'
            });
        }

        fileWriter.write(dataObj);
    });
}

// Let's read some files
function readFile(fileEntry) {

    // Get the file from the file entry
    fileEntry.file(function (file) {

        // Create the reader
        var reader = new FileReader();

        //read 
        reader.onloadend = function () {
            var read = " ";
            read = this.result;
            document.getElementById('filewritep').innerHTML = read; 
            
            console.log("Successful file read: " + this.result);

            console.log("file path: " + fileEntry.fullPath);
            

        };

        reader.readAsText(file);
       //document.getElementById('fileread').innerHTML = reader.readAsText(file);

    }, onError);
    
}

function resetFile() {

    //var resetR = "Waiting for file read text....";
    var resetW = "Waiting for file text....";

    //document.getElementById("filereadp").innerHTML = resetR;
    document.getElementById("filewritep").innerHTML = resetW;
   
}
