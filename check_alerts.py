import json
import os
import alert_tools



def check_alerts():
    latest_data = {}
    
    for filename in os.listdir('alerts'):
        if not filename.endswith('.json'):
            return
        
        try:
            with open(os.path.join('alerts', filename)) as f:
                alert = json.load(f)
        except FileNotFoundError:
            continue
        
        channel = alert['channel']
        username = alert['username']
        market = alert['market'].upper()
        price = float(alert['price'])

        last_price = alert_tools.get_last_price(market)

        alert_message = f"{market} hit {price}!"

        if not market in latest_data:
            # Prevents the system from getting the current price for the same market multiple times
            # YFinance limits you on requests - minimize them wherever possible
            latest_data[market] = alert_tools.get_data(market)
        current_price = latest_data[market]['Close'][-1]
        
        if current_price is None:
            continue
        
        if current_price == price:
            alert_tools.add_message(username, alert_message, channel)
            # Remove alert
            os.remove(os.path.join('alerts', filename))
            continue
        
        if current_price == 0:
            continue
        
        if last_price is None:
            continue

        if last_price < price and current_price > price:
            print("Adding message")
            alert_tools.add_message(username, alert_message, channel)
            # Remove alert
            os.remove(os.path.join('alerts', filename))
            continue
        elif last_price > price and current_price < price:
            print("Adding message")
            alert_tools.add_message(username, alert_message, channel)
            # Remove alert
            os.remove(os.path.join('alerts', filename))
            continue


if __name__ == '__main__':
    check_alerts()
