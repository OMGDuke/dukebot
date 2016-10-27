require('dotenv').config();

var Discord = require("discord.js");
var mybot = new Discord.Client();
var orUrl = "https://eu.api.battle.net/wow/guild/Draenor/Over%20Raided?fields=members&locale=en_GB&apikey=" + process.env.WOW_API_KEY;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var jsonObj;
var filteredArray = [];
var roleList = '';

console.log("Dukebot is online");

mybot.on("message", function(message) {
  console.log("Message received: " + message);
  var commandSplit = message.content.split(" ");

  if(message.content.toUpperCase() === "!HELP") {
    console.log("Help requested");
    message.channel.sendMessage("Available Commands are:\n!slap name\n!(role) (eg !rank1, !rank5)\n!ilevel server characterName\n!deaths server characterName");
  } else if(commandSplit[0].toUpperCase() === "!SLAP" &&
  commandSplit.length === 2) {
    message.channel.sendMessage("Slaps " + commandSplit[1]);
  } else if(message.content.toUpperCase() === "!SLAP") {
    message.channel.sendMessage("Slaps " + message.author);
  } else if(message.content.toUpperCase() in roleHash) {
    classList(message, roleHash[message.content.toUpperCase()]);
  } else if(commandSplit[0].toUpperCase() === "!ILEVEL" &&
    commandSplit.length === 3) {
    iLevel(message, commandSplit);
  } else if(commandSplit[0].toUpperCase() === "!DEATHS" &&
    commandSplit.length === 3) {
    deathCount(message, commandSplit);
  }
});

function apiRequest(url) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", url, false ); // false for synchronous request
  xmlHttp.send( null );
  jsonObj = JSON.parse(xmlHttp.responseText);
}

function roleFinder(rank) {
  for (var i=0; i < jsonObj.members.length; i++) {
    if (jsonObj.members[i].rank === rank) {
      filteredArray.push(jsonObj.members[i]);
    }
  }
}

function rolesToString(rank) {
  roleFinder(rank);
  filteredArray.forEach(createString);
}

function createString(element, index, array) {
  roleList = roleList + 'Name: ' + element.character.name + ', Class: ' +
  playerClassHash[element.character.class] + ', Level: ' +
  element.character.level + '.\n';
}

function classList(message, role) {
  roleList = '';
  filteredArray = [];
  apiRequest(orUrl);
  rolesToString(role);
  console.log(roleList);
  message.channel.sendMessage(roleList);
}

var playerClassHash = {
  1: "Warrior",
  2: "Paladin",
  3: "Hunter",
  4: "Rogue",
  5: "Priest",
  6: "Death Knight",
  7: "Shaman",
  8: "Mage",
  9: "Warlock",
  10: "Monk",
  11: "Druid",
  12: "Demon Hunter"
};

var roleHash = {
  "!RANK1": 0,
  "!RANK2": 1,
  "!RANK3": 2,
  "!RANK4": 3,
  "!RANK5": 4,
  "!RANK6": 5,
  "!RANK7": 6,
  "!RANK8": 7,
  "!RANK9": 8

};

function iLevel(message, commandSplit) {
  var charName = commandSplit[2];
  var serverName = commandSplit[1];
  var gearUrl = 'https://eu.api.battle.net/wow/character/' + serverName +
  '/' + encodeURI(charName) +
  '?fields=items&locale=en_GB&apikey=' + process.env.WOW_API_KEY;
  apiRequest(gearUrl);
  try {
    message.channel.sendMessage(jsonObj.name +'\'s iLevel is: ' +
    JSON.stringify(jsonObj.items.averageItemLevelEquipped));
  }
  catch(err) {
    message.channel.sendMessage(jsonObj.reason);
  }
}

function deathCount(message, commandSplit) {
  var charName = commandSplit[2];
  var serverName = commandSplit[1];
  var statUrl = 'https://eu.api.battle.net/wow/character/' + serverName +
  '/' + encodeURI(charName) +
  '?fields=statistics&locale=en_GB&apikey=' + process.env.WOW_API_KEY;
  apiRequest(statUrl);
  try {
    message.channel.sendMessage(jsonObj.name +' has died ' + findDeaths() + " time(s)");
  }
  catch(err) {
    message.channel.sendMessage(jsonObj.reason);
  }
}

function findDeaths() {
  deaths = jsonObj.statistics.subCategories.filter(function(obj) {
    return obj.name === "Deaths";
  })
  return deaths[0].statistics[0].quantity
}

mybot.login(process.env.DISCORD_API_KEY);
