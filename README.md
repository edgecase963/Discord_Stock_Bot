# Discord_Stock_Bot
This bot was designed to be integrated into Discord and allow users to create alerts and updates on different market movements/behavior.


## Requirements
This bot requires a few Python modules as well as some NodeJS modules.

Open a terminal and navigate to the main directory. Then type the following commands;
```bash
npm install  # Node requirements

pip3 install -r requirements.txt  # Python3 requirements
```

## Usage
Once the requirements have been installed, the rest should be relatively intuitive.

The primary administrator has total control over which other users are allowed to set alerts and notifications.

To set the primary administrator simply open the `primary_admin.txt` file and add the Discord username as the only text within that file.

You'll need to integrate a bot into your Discord server.
You can do this at the following link: https://discord.com/developers/applications

Once you have created a bot, you'll need to copy the bot token and paste it into the `discord_bot_token.txt` file.

From here, simply run the `Stock_Bot.js` file using NodeJS.
```bash
node Stock_Bot.js
```

## Commands
Primary administrator commands:
```
/add user <tag user here>

/remove user <tag user here>

/view users
```

User commands:
```
# add a market to your watchlist
/add market <market symbol>

# remove a market from your watchlist
/remove market <market symbol>

# view your watchlist
/view watchlist

# add an alert to a market
/add alert <market symbol> <price>

# remove an alert from a market
/remove alert <market symbol> <price>

# view your alerts
/view alerts

# add a SQZ_Pro alert to your watchlist
/notify sqzpro <color> <timeframe>

# remove a SQZ_Pro alert from your watchlist
/remove sqzpro

# view your notifications
/view notifications

# view all available commands
/commands
```
All users and the primary administrator can use these commands.

## SQZ_Pro Alerts
Available colors for SQZ_Pro alerts: `red`, `orange`, `yellow`, `green`, `blue`

The SQZ_Pro notifier will send a message into the channel you set the alert when the market enters and/or exits the specified color.