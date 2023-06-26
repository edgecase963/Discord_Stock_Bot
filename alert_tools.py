import json
import time
import os
import yfinance as yf



download_attempts = 5  # Number of times to try downloading data before giving up


def get_data(symbol, interval='15m'):
    data = None
    
    if interval == "1m":
        days = 1
    elif interval == "5m":
        days = 2
    elif interval == "15m":
        days = 3
    elif interval == "30m":
        days = 5
    elif interval == "1h":
        days = 10
    elif interval == "1d":
        days = 60
    
    for i in range(download_attempts):
        try:
            # Download 3 days of data
            data = yf.download(tickers=symbol, period=f"{days}d", interval=interval)
            if data is not None:
                if not data.empty:
                    break
        except:
            time.sleep(1)
            continue
    
    if data is None:
        return None
    
    price_data = {}
    
    # Save price to `previous_prices.json`
    if "previous_prices.json" in os.listdir():
        with open('previous_prices.json') as f:
            price_data = json.load(f)
    
    with open('previous_prices.json', 'w') as f:
        price_data[symbol] = data['Close'][-1]
        json.dump(price_data, f)
    
    return data

def get_last_price(symbol):
    if not 'previous_prices.json' in os.listdir():
        return None
    with open('previous_prices.json') as f:
        price_data = json.load(f)
    
    if not symbol in price_data:
        return None
    
    return float(price_data[symbol])

def add_message(username, message, channel):
    try:
        file_name = f'{username}_{time.time()}.json'
        message_path = os.path.join('messages', file_name)

        message_data = {
            'username': username,
            'message': message,
            'channel': channel,
        }

        with open(message_path, 'w') as f:
            json.dump(message_data, f)
        
        return True
    except Exception as e:
        print(e)
        return False