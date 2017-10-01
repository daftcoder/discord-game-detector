const Discord = require('discord.js');
const bot = new Discord.Client();

const GamesMap = {
   'Overwatch': 'Overwatch',
   'PUBG': 'PUBG',
   'DOTA 2': 'DotA',
   'Heroes of the Storm': 'HOTS'
};

var unsupported = {};

var defaultChannel;

bot.login(process.env.TOKEN);

bot.on('ready', function () {
   console.log('The bot is online !');
   var channels = bot.channels.filterArray(function(channel){ return channel.type === 'text' });
   defaultChannel = channels[0];
});

bot.on('disconnect', function () {
   console.log('Disconnected...');
});

bot.on('presenceUpdate', function (oldMember, newMember) {
   var
      guild = newMember.guild,
      user = newMember.user,
      userName = user.username,
      gameName, gameRoleName, newRole;

   if (!user.presence.game) {
      return;
   }

   gameName = user.presence.game.name;
   gameRoleName = GamesMap[gameName];
   if (!gameRoleName) {
      if (!unsupported.hasOwnProperty(gameName)) {
         unsupported[gameName] = true;
         console.log('Game : unsupported game "' + gameName + '"');
      }
      return;
   }
      
   newRole = guild.roles.find('name', gameRoleName);
   if (!newRole) {
      return;
   }
   
   if (newMember.roles.has(newRole.id)) {
      //console.log('Role : ' + userName + ' already has ' + gameRoleName);
   } else {
      newMember.addRole(newRole).then(function () {
         defaultChannel.send('Я тут заметил, что ' + userName + ' играет в ' + gameName + ' ;)');
         console.log('Role : ' + gameRoleName + ' given to ' + userName);
      }, function (e) {
         console.error(e);
      });
   }
});