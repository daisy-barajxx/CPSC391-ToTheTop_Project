import { GetStocksAggregatesSortEnum, GetStocksAggregatesTimespanEnum, restClient } from "@polygon.io/client-js";
import { env } from "$env/dynamic/private";
import { error } from "@sveltejs/kit";

const rest = restClient(env.APIKEY!, "https://api.polygon.io");

export async function getStockInfo(symbol : string) {
  const response = await getStock(symbol);
  const ticker = response.ticker;
  let open, close;
  let priceChange, percentChange;

  if (response.results) {
    open = response.results[0].o;
    close = response.results[0].c;

    priceChange = close - open;
    percentChange = (priceChange/open)*100;
  } else {
    open = null;
    close = null;
    priceChange = 0;
    percentChange = 0;
  }

  return {
    ticker,
    symbol,
    priceChange,
    percentChange
  };
    
}

//Used to get stock info in place of dummy stocks (ticker, symbol, priceChange, percentChange)
async function getStock(symbol: string) {
  try {
    //Gets previous days data
    const response = await rest.getPreviousStocksAggregates(
      symbol,
      true
    );
    return response;
  } catch (e) {
    throw error(400, "Date inacessible.");
  }
}



export async function getHistory(symbol: string, timespan : string, startDate: string) {
  let timespanEnum;

  const currentTime = new Date();
  const dateArr = [currentTime.getFullYear.toString(), currentTime.getMonth.toString(), currentTime.getDay.toString()];
  const currDate = dateArr.join("-")

  currentTime.getFullYear
  switch (timespan) {
    case "minute":
      timespanEnum = GetStocksAggregatesTimespanEnum.Minute;
      break;
    case "hour":
      timespanEnum = GetStocksAggregatesTimespanEnum.Hour;
      break;
    case "day":
      timespanEnum = GetStocksAggregatesTimespanEnum.Day;
      break;
    case "week":
      timespanEnum = GetStocksAggregatesTimespanEnum.Week;
      break;
    default:
      throw error(400, "Invalid Timespan.");
  }
  try {
    //Gets from specified date to current date on specified timespan (e.g. hour)
    const response = await rest.getStocksAggregates(
      symbol,
      1,
      timespanEnum,
      startDate,
      currDate,
      true
    );
    return response;
  } catch (e) {
    throw error(400, "Date inacessible.");
  }
}