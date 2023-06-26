const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
const { exec } = require('child_process');

// Read the primary admin from the 'admin_username.txt' file
const ADMIN_USERNAME = fs.readFileSync('primary_admin.txt', 'utf8').trim();

// Create a new Discord client with intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ]
});

// Event: When the bot is ready and connected to Discord
client.once('ready', () => {
  console.log('Bot is ready');
  console.log(`Logged in as ${client.user.tag}`);
});

// Function to check for messages and post them to Discord
function checkMessages() {
  // Check the `messages` folder
  // Structure for messages: {'username': <username>, 'message': <message>, 'channel': <channel_name>} for each file
  console.log('Checking for messages...');
  
  const messageFiles = fs.readdirSync('messages');
  
  messageFiles.forEach((messageFile) => {
    const messageData = fs.readFileSync(`messages/${messageFile}`, 'utf8');
    const messageJSON = JSON.parse(messageData);
    
    // Delete the message file
    fs.unlink(`messages/${messageFile}`, (err) => {
      if (err) {
        console.error('Failed to remove message:', err);
        return;
      }
      console.log('Message removed successfully!');
    });
    
    // Now send the message to the Discord channel
    const channel = client.channels.cache.find(channel => channel.name === messageJSON.channel);
    channel.send(messageJSON.message);
  });
}

// Function to check for alert
function checkAlerts() {
  // Define the command to run the Python script
  const pythonAlertScript = 'python3 check_alerts.py';
  
  // Execute the command
  exec(pythonAlertScript, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing the Python script: ${error}`);
      return;
    }
    
    // Process the output
    console.log('Python script output:');
    console.log(stdout);
  });
  
  checkMessages();
}
// Schedule the checkAlertHits function to run every 8 seconds
setInterval(checkAlerts, 8 * 1000);

// Function to check for watchlist-wide notifications
function checkNotifications() {
  // Define the command to run the Python script
  const pythonAlertScript = 'python3 check_notifications.py';
  
  // Execute the command
  exec(pythonAlertScript, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing the Python script: ${error}`);
      return;
    }
    
    // Process the output
    console.log('Python script output:');
    console.log(stdout);
  });
  
  checkMessages();
}
// Schedule the checkAlertHits function to run every 16 seconds
setInterval(checkNotifications, 16 * 1000);

// Function to check if the username is in `watchlists` folder
function checkWatchlist(username) {
  // Returns true if the username is in the `watchlists` folder
  const watchlistFileName = `${username}.json`;
  const watchlistFilePath = `watchlists/${watchlistFileName}`;
  
  // Check if the file exists
  if (fs.existsSync(watchlistFilePath)) {
    return true;
  } else {
    return false;
  }
}

// Function that returns the user's watchlist
function getWatchlist(username) {
  // Returns true if the username is in the `watchlists` folder
  const watchlistFileName = `${username}.json`;
  const watchlistFilePath = `watchlists/${watchlistFileName}`;
  
  // Check if the file exists
  if (fs.existsSync(watchlistFilePath)) {
    const watchlist = fs.readFileSync(watchlistFilePath, 'utf8');
    return JSON.parse(watchlist);
  } else {
    return [];
  }
}

// Function to check if the user has permissions to the bot
async function hasPermissions(username) {
  // Returns true if the username is in the `watchlists` folder
  const watchlistFileName = `${username}.json`;
  const watchlistFilePath = `watchlists/${watchlistFileName}`;
  
  if (username === ADMIN_USERNAME) {
    return true;
  }
  
  // Return true if the file exists
  if (fs.existsSync(watchlistFilePath)) {
    return true;
  } else {
    return false;
  }
}

// Function to add a market to a user's watchlist
async function addMarket(message, username, market) {
  const watchlistFileName = `${username}.json`;
  
  // Open the watchlist and add the market to the list if it's not already there
  fs.readFile(`watchlists/${watchlistFileName}`, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read watchlist:', err);
      message.reply('Failed to add market');
      return;
    }
    
    const watchlist = JSON.parse(data);
    
    if (watchlist.includes(market)) {
      message.reply(`Market ${market} already exists in your watchlist`);
      return;
    }
    
    watchlist.push(market);
    
    fs.writeFile(`watchlists/${watchlistFileName}`, JSON.stringify(watchlist), (err) => {
      if (err) {
        console.error('Failed to add market:', err);
        message.reply('Failed to add market');
      } else {
        console.log(`Market ${market} added successfully!`);
        message.reply(`Market ${market} added successfully!`);
      }
    });
  });
}

// Function to remove a market from a user's watchlist
async function removeMarket(message, username, market) {
  const watchlistFileName = `${username}.json`;
  
  // Open the watchlist and remove the market from the list if it's there
  fs.readFile(`watchlists/${watchlistFileName}`, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to read watchlist:', err);
      message.reply('Failed to remove market');
      return;
    }
    
    const watchlist = JSON.parse(data);
    
    if (!watchlist.includes(market)) {
      message.reply(`Market ${market} does not exist in your watchlist`);
      return;
    }
    
    watchlist.splice(watchlist.indexOf(market), 1);
    
    fs.writeFile(`watchlists/${watchlistFileName}`, JSON.stringify(watchlist), (err) => {
      if (err) {
        console.error('Failed to remove market:', err);
        message.reply('Failed to remove market');
      } else {
        console.log(`Market ${market} removed successfully!`);
        message.reply(`Market ${market} removed successfully!`);
      }
    });
  });
}

// Function to add a watchlist
async function addWatchlist(username) {
  // Gives a user permissions to add watchlists, alerts, etc
  // Adds their watchlist to the `watchlists` folder titled with their username.json
  // The json file contains an empty list
  const watchlistFileName = `${username}.json`;
  const watchlistFilePath = `watchlists/${watchlistFileName}`;
  const watchlistData = [];
  
  fs.writeFile(watchlistFilePath, JSON.stringify(watchlistData), (err) => {
    if (err) {
      console.error('Failed to add user:', err);
      return false;
    } else {
      console.log('User added successfully!');
      return true;
    }
  });
}

// Function to remove a watchlist
async function removeWatchlist(username) {
  // Removes a user's watchlist from the `watchlists` folder
  const watchlistFileName = `${username}.json`;
  const watchlistFilePath = `watchlists/${watchlistFileName}`;
  
  fs.unlink(watchlistFilePath, (err) => {
    if (err) {
      console.error('Failed to remove user:', err);
      return false;
    } else {
      console.log('User removed successfully!');
      return true;
    }
  });
}

// Function for adding an alert
async function addAlert(username, channel, market, price) {
  // Adds an alert to a user's watchlist
  // Alerts are stored in the watchlist json file
  const alertFileName = `${username}_${channel}_${market}_${price}.json`;
  const alertFilePath = `alerts/${alertFileName}`;
  const alertData = {
    channel: channel,
    username: username,
    market: market,
    price: price,
  };
  
  fs.writeFile(alertFilePath, JSON.stringify(alertData), (err) => {
    if (err) {
      console.error('Failed to add alert:', err);
      return false;
    } else {
      console.log('Alert added successfully!');
      return true;
    }
  });
}

// Function to save json data to a file
async function saveData(data, path) {
  // Saves the data to the path specified
  // File is saved in the `data` folder
  fs.writeFile(path, JSON.stringify(data), (err) => {
    if (err) {
      console.error('Failed to save data:', err);
      return false;
    } else {
      console.log('Data saved successfully!');
      return true;
    }
  });
}

// Function that returns the user's notifications from the `notifications` folder
function getNotifications(username) {
  // Returns true if the username is in the `notifications` folder
  // Finds each file that starts with their username and returns the data
  const notificationFiles = fs.readdirSync('notifications');
  
  const userNotifications = [];
  
  notificationFiles.forEach((notificationFile) => {
    if (notificationFile.startsWith(username)) {
      const notificationData = fs.readFileSync(`notifications/${notificationFile}`, 'utf8');
      const notificationJSON = JSON.parse(notificationData);
      const type = notificationJSON.type;
      const timeframe = notificationJSON.timeframe;
      const channel = notificationJSON.channel;

      const notificationText = `${type} ${timeframe} on ${channel}`;
      userNotifications.push(notificationText);
    }
  });
  
  return userNotifications;
}

// Function to remove an alert
function removeAlert(username, channel, market, price) {
  // Run through each file in the `alerts` folder
  // Find the one that matches the username, channel, market, and price variables
  // Delete the file
  console.log(`Removing alert for ${username} on channel ${channel} for market ${market} at price ${price}`);
  
  const alertFileName = `${username}_${channel}_${market}_${price}.json`;
  const alertFilePath = `alerts/${alertFileName}`;
  
  fs.unlink(alertFilePath, (err) => {
    if (err) {
      console.error('Failed to remove alert:', err);
      return false;
    } else {
      console.log('Alert removed successfully!');
      return true;
    }
  });
}

// Function to retrieve alert for the user
function getAlerts(username) {
  // Sift through every file in the `alerts` folder
  // Find the ones that start with the username and return them
  // Remove the .json extension from the file name
  const alertFiles = fs.readdirSync('alerts');
  
  const userAlerts = [];
  
  alertFiles.forEach((alertFile) => {
    if (alertFile.startsWith(username)) {
      const alertData = fs.readFileSync(`alerts/${alertFile}`, 'utf8');
      const alertJSON = JSON.parse(alertData);
      userAlerts.push(`#${alertJSON.channel} - ${alertJSON.market}: ${alertJSON.price}`);
    }
  });
  
  return userAlerts;
}

// Function to get a list of users
function getUsers() {
  // Sift through every file in the `watchlists` folder
  // Remove the .json extension from the file name
  const watchlistFiles = fs.readdirSync('watchlists');
  
  const users = [];
  
  watchlistFiles.forEach((watchlistFile) => {
    const user = watchlistFile.split('.')[0];
    users.push(user);
  });
  
  return users;
}

// Event: When the bot receives a message
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore messages from other bots
  
  const command = message.content.trim();
  
  if (message.author.username === ADMIN_USERNAME) {
    // Check if the primary admin has a watchlist or not
    // If not - add one
    if (!checkWatchlist(ADMIN_USERNAME)) {
      console.log('Admin does not have a watchlist - adding one...');
      await addWatchlist(ADMIN_USERNAME);
    }
    
    // If the message is from the admin, process the command
    if (command.startsWith('/add user')) {
      const mentionedUser = message.mentions.users.first(); // Get the first mentioned user
      if (mentionedUser) {
        const mentionedMember = message.guild.members.cache.get(mentionedUser.id); // Get the member object for additional information
        const mentionedUsername = mentionedMember ? mentionedMember.user.username : mentionedUser.username;
        
        if (mentionedUsername === ADMIN_USERNAME) {
          message.reply('You are the primary admin - you cannot add yourself');
          return;
        }
        
        if (mentionedUsername === client.user.username) {
          message.reply('You cannot add me as a user');
          return;
        }
        
        // Now add the user
        const successfullyAddedUser = addWatchlist(mentionedUsername);
        if (successfullyAddedUser) {
          message.reply(`User ${mentionedUsername} added successfully!`);
        }
      } else {
        message.reply('You need to mention a user to add');
      }
    }
    
    if (command.startsWith('/remove user')) {
      const mentionedUser = message.mentions.users.first(); // Get the first mentioned user
      if (mentionedUser) {
        const mentionedMember = message.guild.members.cache.get(mentionedUser.id); // Get the member object for additional information
        const mentionedUsername = mentionedMember ? mentionedMember.user.username : mentionedUser.username;
        
        if (mentionedUsername === ADMIN_USERNAME) {
          message.reply('You are the primary admin - you cannot remove yourself');
          return;
        }
        
        if (mentionedUsername === client.user.username) {
          message.reply('You cannot remove me as a user');
          return;
        }
        
        // Now remove the user
        const successfullyRemovedUser = removeWatchlist(mentionedUsername);
        if (successfullyRemovedUser) {
          message.reply(`User ${mentionedUsername} removed successfully!`);
        }
      } else {
        message.reply('You need to mention a user to remove');
      }
    }
    
    if (command.startsWith('/view users')) {
      const users = getUsers();
      message.reply(`Users: ${users.join(', ')}`);
    }
  }
  
  // Check permissions using the hasPermissions function
  if (hasPermissions(message.author.username)) {
    // Check if they have a watchlist or not
    
    if (command.startsWith('/add market')) {
      const market = command.slice(11).trim().toUpperCase();
      await addMarket(message, message.author.username, market);
    }
    
    if (command.startsWith('/remove market')) {
      const market = command.slice(14).trim().toUpperCase();
      await removeMarket(message, message.author.username, market);
    }
    
    if (command.startsWith('/view watchlist')) {
      const watchlist = getWatchlist(message.author.username);
      
      // Format the message so each item in watchlist has a space after the comma
      const formattedWatchlist = watchlist.join(', ');
      message.reply(`Your watchlist: ${formattedWatchlist}`);
    }
    
    if (command.startsWith('/add alert')) {
      // Format: /add alert <market> <price>
      // Use the channel the user messaged in as the alert channel
      const match = command.match(/^\/add alert (.+) (\d+\.?\d*)$/);
      if (match) {
        const channel = message.channel.name;
        const market = match[1];
        const price = match[2];
        
        const alertAdded = addAlert(message.author.username, channel, market, price);
        if (alertAdded) {
          message.reply(`Alert added successfully!`);
        } else {
          message.reply(`Failed to add alert`);
        }
      }
    }
    
    if (command.startsWith('/remove alert')) {
      // Format: /remove alert <market> <price>
      // Use the channel the user messaged in as the alert channel
      const match = command.match(/^\/remove alert (.+) (\d+\.?\d*)$/);
      if (match) {
        const channel = message.channel.name;
        const market = match[1];
        const price = match[2];
        removeAlert(message.author.username, channel, market, price);
        message.reply(`Alert removed!`);
      }
    }
    
    if (command.startsWith('/view alerts')) {
      const alerts = getAlerts(message.author.username);
      message.reply(`Your alerts: ${alerts.join(', ')}`);
    }
    
    if (command.startsWith('/notify sqzpro')) {
      // Format: /notify sqzpro <color> <timeframe>
      // Notifies the user when the sqzpro indicator changes into/out of the color
      const match = command.match(/^\/notify sqzpro (red|orange|yellow|green|blue) (1m|5m|15m|30m|1h|4h|1d)$/);
      if (match) {
        const data = {
          color: match[1],
          timeframe: match[2],
          type: 'sqzpro',
          channel: message.channel.name,
          username: message.author.username,
        }
        saveData(data, `notifications/${message.author.username}_sqzpro.json`);
        message.reply(`Sqzpro notification for ${match[1]} added successfully!`);
      } else {
        message.reply('Invalid command format');
        message.reply('Format: /notify sqzpro <color> <timeframe>');
      }
    }
    
    if (command.startsWith('/remove sqzpro')) {
      // Attempt to remove the {username}_sqzpro.json file from the `notifications` folder
      const path = `notifications/${message.author.username}_sqzpro.json`;
      fs.unlink(path, (err) => {
        if (err) {
          console.error('Failed to remove sqzpro notification:', err);
          message.reply('Failed to remove sqzpro notification');
        } else {
          console.log('Sqzpro notification removed successfully!');
          message.reply('Sqzpro notification removed successfully!');
        }
      });
    }

    if (command.startsWith('/view notifications')) {
      // Uses the getNotifications function to retrieve the user's notifications
      const notifications = getNotifications(message.author.username);
      message.reply(`Your notifications: ${notifications.join(', ')}`);
    }

    if (command === '/commands') {
      const commands = [
        '/add market <market>',
        '/remove market <market>',
        '/view watchlist',
        '/add alert <market> <price>',
        '/remove alert <market> <price>',
        '/view alerts',
        '/notify sqzpro <color> <timeframe>',
        '/remove sqzpro',
        '/view notifications',
      ];
      message.reply(`Commands: ${commands.join(', ')}`);
    }
  }
});

// Read the Discord bot token from a local file
fs.readFile('discord_bot_token.txt', 'utf8', (err, token) => {
  if (err) {
    console.error('Failed to read Discord bot token:', err);
    return;
  }
  
  // Login to Discord with the bot token
  client.login(token.trim());
});
