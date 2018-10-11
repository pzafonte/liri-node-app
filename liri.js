// import modules and packages
const request = require("request");
const Spotify = require("node-spotify-api");
const moment = require("moment");
const fs = require("fs");
const os = require("os");


// turn on dotenv to load up environment variables from .env file
require("dotenv").config();

const spotifyKeys = require("./keys.js");

// turn on new spotify app
const spotify = new Spotify(spotifyKeys.spotify);

let command = process.argv[2];
let argument = process.argv.slice(3).join(" ");

const concertThis = function (searchQuery) {

  let queryUrl = "https://rest.bandsintown.com/artists/" + searchQuery + "/events?app_id=codingbootcamp";

  request(queryUrl, function (error, response, body) {

    if (!error && response.statusCode === 200) {

      let venueList = JSON.parse(body);
      let output = `Concert This Results: '${searchQuery}'\n`;

      for (let i in venueList) {
        let result = venueList[i];
        output += "-".repeat(30) + "\n";
        output += `Venue: ${result.venue.name}\n`;
        output += `Location: ${result.venue.city}, ${result.venue.region}\n`;
        output += `Date: ${moment(result.datetime).format("MM/DD/YYYY")}\n`;
        output += "-".repeat(30) + "\n";
      }
      writeResults(output);
    }

  });



}
const spotifyThisSong = function (searchQuery) {

  spotify.search({
    type: 'track',
    query: searchQuery
  }, function (err, data) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }

    let output = `Spotify This Song: '${searchQuery}'\n`;
    let trackList = data.tracks.items;
    for (let i in trackList) {
      let song = trackList[i];
      let artists = song.artists.map(a => a.name);

      output += "-".repeat(30) + "\n";
      output += `Artist(s): ${artists.join(", ")}\n`;
      output += `Song: ${song.name}\n`;
      output += `Preview: ${song.preview_url}\n`
      output += `Album: ${song.album.name}\n`;
      output += "-".repeat(30) + "\n";

    }

    writeResults(output);
  });
}

const movieThis = function (searchQuery) {

  let queryUrl = "http://www.omdbapi.com/?t=" + searchQuery + "&y=&plot=short&apikey=trilogy";

  request(queryUrl, function (error, response, body) {

    if (!error && response.statusCode === 200) {

      const movie = JSON.parse(body);
      let output = `Movie This Results: '${searchQuery}'\n`;
      output += "-".repeat(30) + "\n";
      output += `Title: ${movie.Title}\n`;
      output += `Year: ${movie.Year}\n`;
      output += `IMDB Rating: ${movie.imdbRating}\n`;
      output += `RottenTomatoes Rating: ${(movie.Ratings[1]) ? movie.Ratings[1].Value : "N/A"}\n`;
      output += `Production Country: ${movie.Country}\n`;
      output += `Language: ${movie.Language}\n`;
      output += `Plot: ${movie.Plot}\n`;
      output += `Actors: ${movie.Actors}\n`;
      output += "-".repeat(30) + "\n";
      writeResults(output);
    }
  });

}

const doWhatItSays = function () {
  fs.readFile('random.txt', 'utf8', (err, data) => {
    if (err) throw err;
    

    //In order to run multiple commands we find the end of the line using node's os module
    const commands = data.split(os.EOL);

    if (commands.length === 1 && commands[0] === "") {
      writeResult(`Do What It Says: Error, no commands listed in random.txt\n`);
    }

    commands.forEach(command => {
      if (command === "") {
        return;
      }

      let seperator = command.indexOf(",");

      let commandArg1 = (seperator >= 0) ? command.substring(0, seperator).trim().replace(/['"]+/g, '') : command; //replace strips out double quotes
      let commandArg2 = (seperator >= 0) ? command.substring(seperator + 1).trim().replace(/['"]+/g, '') : undefined;

      runCommand(commandArg1, commandArg2);
    });

  });

}
const writeResults = function (output) {

  console.log(output);

  fs.appendFile('log.txt', output, 'utf8', (err) => {
    if (err) throw err;
  });

}

function runCommand(command, argument) {
  switch (command) {
      case "concert-this":
          concertThis((argument) ? argument : "Modest Mouse");
          break;

      case "spotify-this-song":
          spotifyThisSong((argument) ? argument : "The Sign");
          break;

      case "movie-this":
          movieThis((argument) ? argument : "Mr. Nobody");
          break;

      case "do-what-it-says":
          doWhatItSays();
          break;

      default:
          writeResults(`liri-node-app error:\n"${command}" is a not liri command.\nAcceptable commands are "concert-this", "spotify-this-song", "movie-this", or "do-what-it-says".\n`);

  }
}

runCommand(command, argument);