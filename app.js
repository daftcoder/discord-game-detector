const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const GamesMap = JSON.parse(fs.readFileSync('gamesMap.json', 'utf8'));

// Map of games we don't support (for logging)
var unsupported = {};

// Text channel to write
var defaultChannel;

// Channel name for spamming
var channelName = process.env.CHANNEL || null;

bot.login(process.env.TOKEN);

bot.on('ready', function () {
   console.log('The bot is online !');
   var channels = bot.channels.filterArray(function (channel) {
      return channel.type === 'text' && (!channelName || channel.name === channelName);
   });

   if (!channels.length) {
      if (channelName) {
         console.log('Channel : There is no channel with name "' + channelName + '"');
      } else {
         console.log('Channel : No text channels are available');
      }
   } else {
      defaultChannel = channels[0];
   }
});

bot.on('disconnect', function () {
   console.log('Disconnected...');
});

bot.on('presenceUpdate', function (oldMember, newMember) {
   var user = newMember.user;

   if (!user.presence.game) {
      return;
   }

   var gameName = user.presence.game.name;
   var gameRoleName = GamesMap[gameName];
   if (!gameRoleName) {
      if (!unsupported.hasOwnProperty(gameName)) {
         unsupported[gameName] = true;
         console.log('Game : unsupported game "' + gameName + '"');
      }
      return;
   }
      
   var newRole = newMember.guild.roles.find('name', gameRoleName);
   if (!newRole) {
      return;
   }
   
   if (newMember.roles.has(newRole.id)) {
      //console.log('Role : ' + userName + ' already has ' + gameRoleName);
   } else {
      var userName = user.username;
      newMember.addRole(newRole).then(function () {
         defaultChannel.send('Я тут заметил, что ' + user + ' играет в ' + gameName + ' ;)');
         console.log('Role : ' + gameRoleName + ' given to ' + userName);
      }, function (e) {
         console.error(e);
      });
   }
});
