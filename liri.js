// Load Required Node Modules
require('dotenv').config();
// var keys = require('keys.js');
var Spotify = require('node-spotify-api');
// var spotify = new Spotify(keys.spotify);
var spotify = new Spotify({
	id: 'b862cb200bd24d5884cea0e170455b1d',
	secret: 'f697c4bda4834df6b523f9dfd89291d0'
});
var bandsintown = require('bandsintown')('codingbootcamp')
var request = require('request');
var moment = require ('moment');
var fs = require('fs');//file system module
var cmdArgs = process.argv;

// The LIRI command will always be the second command line argument
var liriCommand = cmdArgs[2];

// The parameter to the LIRI command may contain spaces
var liriArg = '';
for (var i = 3; i < cmdArgs.length; i++) {
	liriArg += cmdArgs[i] + ' ';
}

function concertThis(band) {
	// Append the command to the log file
	fs.appendFile('./log.txt', 'User Command: node liri.js concert-this ' + band + '\n\n', (err) => {
		if (err) throw err;
	});

	// Construct the query string
	var queryURL = "https://bandsintown.com/artists/" + band + "/events?app_id=codingbootcamp";
	request(queryURL, function (error, response, body) {
		//If no error and response is a success
		if (!error && response.statusCode === 200) {
			var data = JSON.parse(body);//Parse the json response
			for (var i = 0; i < data.length; i++) {//Loop through array
				console.log("Venue: " + data[i].venue.name);//Get venue name
				//Append data to log.txt
				fs.appendFileSync("log.txt", "Venue: " + data[i].venue.name + "\n", function (error) {
					if (error) {
						console.log(error);
					};
				});

				//Get venue location
				//If statement for concerts without a region
				if (data[i].venue.region == "") {
					console.log("Location: " + data[i].venue.city + ", " + data[i].venue.country);
					//Append data to log.txt
					fs.appendFileSync("log.txt", "Location: " + data[i].venue.city + ", " + data[i].venue.country + "\n", function (error) {
						if (error) {
							console.log(error);
						};
					});

				} else {
					console.log("Location: " + data[i].venue.city + ", " + data[i].venue.region + ", " + data[i].venue.country);
					//Append data to log.txt
					fs.appendFileSync("log.txt", "Location: " + data[i].venue.city + ", " + data[i].venue.region + ", " + data[i].venue.country + "\n", function (error) {
						if (error) {
							console.log(error);
						};
					});
				}

				//Get date of show
				var date = data[i].datetime;
				date = moment(date).format("MM/DD/YYYY");
				console.log("Date: " + date)
				//Append data to log.txt
				fs.appendFileSync("log.txt", "Date: " + date + "\n----------------\n", function (error) {
					if (error) {
						console.log(error);
					};
				});
				console.log("----------------")
			}
		}
	});
};

// spotifySong will retrieve information on a song from Spotify
function spotifySong(song) {
	// Append the command to the log file
	fs.appendFile('./log.txt', 'User Command: node liri.js spotify-this-song ' + song + '\n\n', (err) => {
		if (err) throw err;
	});

	// If no song is provided, LIRI defaults to 'The Sign' by Ace Of Base
	var search;
	if (song === '') {
		search = 'The Sign Ace Of Base';
	} else {
		search = song;
	}

	spotify.search({ type: 'track', query: search }, function (error, data) {
		if (error) {
			var errorStr1 = 'ERROR: Retrieving Spotify track -- ' + error;

			// Append the error string to the log file
			fs.appendFile('./log.txt', errorStr1, (err) => {
				if (err) throw err;
				console.log(errorStr1);
			});
			return;
		} else {
			var songInfo = data.tracks.items[0];
			if (!songInfo) {
				var errorStr2 = 'ERROR: No song info retrieved, please check the spelling of the song name!';

				// Append the error string to the log file
				fs.appendFile('./log.txt', errorStr2, (err) => {
					if (err) throw err;
					console.log(errorStr2);
				});
				return;
			} else {
				// Pretty print the song information
				var outputStr = '------------------------\n' +
					'Song Information:\n' +
					'------------------------\n\n' +
					'Song Name: ' + songInfo.name + '\n' +
					'Artist: ' + songInfo.artists[0].name + '\n' +
					'Album: ' + songInfo.album.name + '\n' +
					'Preview Here: ' + songInfo.preview_url + '\n';

				// Append the output to the log file
				fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputStr + '\n', (err) => {
					if (err) throw err;
					console.log(outputStr);
				});
			}
		}
	});
}

// retrieveOMDBInfo will retrieve information on a movie from the OMDB database
function retrieveOBDBInfo(movie) {
	// Append the command to the log file
	fs.appendFile('./log.txt', 'User Command: node liri.js movie-this ' + movie + '\n\n', (err) => {
		if (err) throw err;
	});

	// If no movie is provided, LIRI defaults to 'Mr. Nobody'
	var search;
	if (movie === '') {
		search = 'Mr. Nobody';
	} else {
		search = movie;
	}

	// Replace spaces with '+' for the query string
	search = search.split(' ').join('+');

	// Construct the query string
	var queryStr = 'http://www.omdbapi.com/?t=' + search + '&y=&plot=short&apikey=trilogy';

	// Send the request to OMDB
	request(queryStr, function (error, response, body) {
		if (error || (response.statusCode !== 200)) {
			var errorStr1 = 'ERROR: Retrieving OMDB entry -- ' + error;

			// Append the error string to the log file
			fs.appendFile('./log.txt', errorStr1, (err) => {
				if (err) throw err;
				console.log(errorStr1);
			});
			return;
		} else {
			var data = JSON.parse(body);
			if (!data.Title && !data.Released && !data.imdbRating) {
				var errorStr2 = 'ERROR: No movie info retrieved, please check the spelling of the movie name!';

				// Append the error string to the log file
				fs.appendFile('./log.txt', errorStr2, (err) => {
					if (err) throw err;
					console.log(errorStr2);
				});
				return;
			} else {
				// Pretty print the movie information
				var outputStr = '------------------------\n' +
					'Movie Information:\n' +
					'------------------------\n\n' +
					'Movie Title: ' + data.Title + '\n' +
					'Year Released: ' + data.Released + '\n' +
					'IMBD Rating: ' + data.imdbRating + '\n' +
					'Country Produced: ' + data.Country + '\n' +
					'Language: ' + data.Language + '\n' +
					'Plot: ' + data.Plot + '\n' +
					'Actors: ' + data.Actors + '\n' +
					'Rotten Tomatoes Rating: ' + data.tomatoRating + '\n' +
					'Rotten Tomatoes URL: ' + data.tomatoURL + '\n';

				// Append the output to the log file
				fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputStr + '\n', (err) => {
					if (err) throw err;
					console.log(outputStr);
				});
			}
		}
	});
}

// doWhatItSays will read in a file to determine the desired command and then execute
function doWhatItSays() {
	// Append the command to the log file
	fs.appendFile('./log.txt', 'User Command: node liri.js do-what-it-says\n\n', (err) => {
		if (err) throw err;
	});

	// Read in the file containing the command
	fs.readFile('./random.txt', 'utf8', function (error, data) {
		if (error) {
			console.log('ERROR: Reading random.txt -- ' + error);
			return;
		} else {
			// Split out the command name and the parameter name
			var cmdString = data.split(',');
			var command = cmdString[0].trim();
			var param = cmdString[1].trim();

			switch (command) {

				case 'spotify-this-song':
					spotifySong(param);
					break;

				case 'movie-this':
					retrieveOBDBInfo(param);
					break;
			}
		}
	});
}

// Determine which LIRI command is being requested by the user
if (liriCommand === 'concert-this') {
	concertThis(liriArg);

} else if (liriCommand === `spotify-this-song`) {
	spotifySong(liriArg);

} else if (liriCommand === `movie-this`) {
	retrieveOBDBInfo(liriArg);

} else if (liriCommand === `do-what-it-says`) {
	doWhatItSays();

} else {
	// Append the command to the log file
	fs.appendFile('./log.txt', 'User Command: ' + cmdArgs + '\n\n', (err) => {
		if (err) throw err;

		// If the user types in a command that LIRI does not recognize, output the Usage menu 
		// which lists the available commands.
		outputStr = 'Usage:\n' +
			'    node liri.js concert-this "<band_name>"\n' +
			'    node liri.js spotify-this-song "<song_name>"\n' +
			'    node liri.js movie-this "<movie_name>"\n' +
			'    node liri.js do-what-it-says\n';

		// Append the output to the log file
		fs.appendFile('./log.txt', 'LIRI Response:\n\n' + outputStr + '\n', (err) => {
			if (err) throw err;
			console.log(outputStr);
		});
	});
}


// axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp").then(
// 	function(response){
// 		// Name of the venue 
// 		console.log(response.data.venue);
// 		// Venue location

// 		// Date of the Event (use moment to format this as "MM/DD/YYYY")

// 	}
// );

// spotify.search({ type: 'track', query: 'All the Small Things' }, function(err, data) {
// 	// Artist(s)
// 	// The song's name
// 	// A preview link of the song from Spotify
// 	// The album that the song is from
//   if (err) {
//     return console.log('Error occurred: ' + err);
//   }

// console.log(data); 
// });

// axios.get("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy").then(
//   function(response) {
//     console.log(response)
// 		console.log("The movie's rating is: " + response.data.imdbRating);
// 	// 	* Title of the movie.
//   //  * Year the movie came out.
//   //  * IMDB Rating of the movie.
//   //  * Rotten Tomatoes Rating of the movie.
//   //  * Country where the movie was produced.
//   //  * Language of the movie.
//   //  * Plot of the movie.
//   //  * Actors in the movie.

//   }
// );


