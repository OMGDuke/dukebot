require('dotenv').config();

var Discord = require("discord.js");
var mybot = new Discord.Client();
var orUrl = "https://eu.api.battle.net/wow/guild/Draenor/Over%20Raided?fields=members&locale=en_GB&apikey=" + process.env.WOW_API_KEY;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var jsonObj;
var filteredArray = [];
var roleList = '';

mybot.on("message", function(message) {
  var commandSplit = message.content.split(" ");

  if(message.content.toUpperCase() === "!HELP") {
      mybot.sendMessage(message, "Available Commands are:\n!slap name\n!(role) (eg !alt, !member)\n!ilevel server characterName");
  } else if(commandSplit[0].toUpperCase() === "!SLAP" &&
    commandSplit.length === 2) {
      mybot.sendMessage(message, "Slaps " + commandSplit[1]);
  } else if(message.content.toUpperCase() === "!SLAP") {
    mybot.sendMessage(message, "Slaps " + message.author);
  } else if(message.content.toUpperCase() === "!GM") {
    classList(message, 0);
  } else if(message.content.toUpperCase() === "!OFFICER") {
    classList(message, 1);
  } else if(message.content.toUpperCase() === "!VETERAN") {
    classList(message, 2);
  } else if(message.content.toUpperCase() === "!MEMBER") {
    classList(message, 3);
  } else if(message.content.toUpperCase() === "!ALT") {
    classList(message, 4);
  } else if(message.content.toUpperCase() === "!RECRUIT") {
    classList(message, 5);
  } else if(commandSplit[0].toUpperCase() === "!ILEVEL" &&
    commandSplit.length === 3) {
    iLevel(message, commandSplit);
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
  classFinder(element.character.class) + ', Level: ' +
  element.character.level + '.\n';
}

function classList(message, role) {
  roleList = '';
  filteredArray = [];
  apiRequest(orUrl);
  rolesToString(role);
  console.log(roleList);
  mybot.sendMessage(message, roleList);
}

function classFinder(classNum) {
  if(classNum === 1) {
    return "Warrior";
  } else if(classNum === 2) {
    return "Paladin";
  } else if(classNum === 3) {
    return "Hunter";
  } else if(classNum === 4) {
    return "Rogue";
  } else if(classNum === 5) {
    return "Priest";
  } else if(classNum === 6) {
    return "Death Knight";
  } else if(classNum === 7) {
    return "Shaman";
  } else if(classNum === 8) {
    return "Mage";
  } else if(classNum === 9) {
    return "Warlock";
  } else if(classNum === 10) {
    return "Monk";
  } else if(classNum === 11) {
    return "Druid";
  }
}

function iLevel(message, commandSplit) {
  var charName = commandSplit[2];
  var serverName = commandSplit[1];
  var gearUrl = 'https://eu.api.battle.net/wow/character/' + serverName +
  '/' + encodeURI(charName) +
  '?fields=items&locale=en_GB&apikey=' + process.env.WOW_API_KEY;
  apiRequest(gearUrl);
  mybot.sendMessage(message, jsonObj.name +'\'s iLevel is: ' +
  JSON.stringify(jsonObj.items.averageItemLevelEquipped));
}

mybot.loginWithToken(process.env.DISCORD_API_KEY);
