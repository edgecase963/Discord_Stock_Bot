import pandas as pd
import numpy as np


def true_range(df):
    high = df['High']
    low = df['Low']
    prev_close = df['Close'].shift(1)

    tr = pd.DataFrame(index=df.index)
    tr['tr1'] = high - low
    tr['tr2'] = np.abs(high - prev_close)
    tr['tr3'] = np.abs(low - prev_close)

    true_range = tr.max(axis=1)

    return true_range

def stdev(data, length):
    # Calculate the standard deviation of the data
    return data.rolling(window=length).std(ddof=0)  # Adjust ddof parameter to match Pinescript behavior

def get_sma(data, length):
    # Calculate the simple moving average of the data
    return data.rolling(window=length).mean()

def calculate_sqzpro(df, length=20, source="Close"):
    # Create new variables for indicators and squeeze conditions
    if source.lower() == "ohlc4":
        df[source] = (df["Open"] + df["High"] + df["Low"] + df["Close"]) / 4

    ma = get_sma(df[source], length)
    devBB = stdev(df[source], length)
    devKC = get_sma(true_range(df), length)

    # Bollinger 2x
    upBB = ma + devBB * 2
    lowBB = ma - devBB * 2

    # Keltner 2x
    upKCWide = ma + devKC * 2
    lowKCWide = ma - devKC * 2

    # Keltner 1.5x
    upKCNormal = ma + devKC * 1.5
    lowKCNormal = ma - devKC * 1.5

    # Keltner 1x
    upKCNarrow = ma + devKC
    lowKCNarrow = ma - devKC

    sqzOnWide = (lowBB >= lowKCWide) & (upBB <= upKCWide)  # Orange
    sqzOnNormal = (lowBB >= lowKCNormal) & (upBB <= upKCNormal)  # Red
    sqzOnNarrow = (lowBB >= lowKCNarrow) & (upBB <= upKCNarrow)  # Yellow
    sqzOffWide = (lowBB < lowKCWide) & (upBB > upKCWide)  # Lime
    noSqz = (~sqzOnWide) & (~sqzOffWide)  # Blue

    # Momentum Oscillator
    # Pinescript: linreg(source  -  avg(avg(highest(high, length), lowest(low, length)), sma(close,length)), length, 0)
    highest_high = df['High'].rolling(window=length).max()
    lowest_low = df['Low'].rolling(window=length).min()
    average_hl = (highest_high + lowest_low) / 2
    mom = df[source] - average_hl.rolling(window=length).mean()
    mom = mom.rolling(window=length).sum() / length

    sq_color = []
    for i in range(len(df)):
        if sqzOnNarrow[i]:
            sq_color.append("yellow")
        elif sqzOnNormal[i]:
            sq_color.append("red")
        elif sqzOnWide[i]:
            sq_color.append("orange")
        elif sqzOffWide[i]:
            sq_color.append("lime")
        else:
            sq_color.append("blue")

    sq_color = pd.Series(sq_color, index=df.index)

    return mom, sq_color
