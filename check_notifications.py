import data_tools
import json
import os
import alert_tools



def check_notifications():
    latest_data = {}
    # Now check `notifications`
    for filename in os.listdir('notifications'):
        if not filename.endswith('.json'):
            return
        
        try:
            with open(os.path.join('notifications', filename)) as f:
                notification = json.load(f)
        except FileNotFoundError:
            continue
        
        type = notification['type']
        channel = notification['channel']
        username = notification['username']
        timeframe = notification['timeframe']

        if not os.path.exists(os.path.join('watchlists', f'{username}.json')):
            continue

        with open(os.path.join('watchlists', f'{username}.json')) as f:
            watchlist = json.load(f)
        
        for market in watchlist:
            if not timeframe in latest_data:
                # Add the timeframe into the `latest_data` dictionary for later use
                latest_data[timeframe] = {}
            
            if not market in latest_data[timeframe]:
                # Prevents the system from getting the current price for the same market multiple times
                # YFinance limits you on requests - minimize them wherever possible
                latest_data[timeframe][market] = alert_tools.get_data(market, interval=timeframe)
            data = latest_data[timeframe][market]
            
            if type == "sqzpro":
                if not os.path.exists("previous_sqzpro_colors.json"):
                    # Create it
                    with open("previous_sqzpro_colors.json", 'w') as f:
                        json.dump({}, f)
                
                with open("previous_sqzpro_colors.json") as f:
                    prev_colors = json.load(f)
                
                color = notification['color']
                mom, sq_colors = data_tools.calculate_sqzpro(data)
                current_color = sq_colors[-1].lower()
                
                print(f"{market}: SQZ_Pro color is {current_color}")
                
                if not market in prev_colors:
                    prev_colors[market] = current_color
                
                if prev_colors[market] != current_color and current_color == color:
                    # Send message
                    alert_tools.add_message(username, f"{market} now entering {current_color} on {timeframe} time-frame!", channel)
                    # Update previous colors
                    prev_colors[market] = current_color
                
                if prev_colors[market] == color and current_color != color:
                    # Send message
                    alert_tools.add_message(username, f"{market} now exiting {color} on {timeframe} time-frame!", channel)
                    # Update previous colors
                    prev_colors[market] = current_color
                
                # Save the previous colors file
                with open("previous_sqzpro_colors.json", 'w') as f:
                    json.dump(prev_colors, f)


if __name__ == '__main__':
    check_notifications()
