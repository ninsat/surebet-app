import betplay from '../bettingStores/betplay';
import xbet from '../bettingStores/xbet';
import yajuego from '../bettingStores/yajuego'


import footballMarket from '../markets.json';
import basketballMarkets from '../markets/markets-basketball.json';
import tennisMarkets from '../markets/markets-tennis.json';

import utilities from './utilities'
import surebets from "./surebets"






const getLiveSurebets = async () => {
    const bookMarkets = {
        betplay: {
            getMatch: betplay.getLiveMatch,
            getEvents: betplay.getLiveEvents,
            active: true,
        },
        xbet: {
            getMatch: xbet.getLiveMatch,
            getEvents: xbet.getLiveEvents,
            active: true,
        },
        yajuego: {
            getMatch: yajuego.getLiveMatch,
            getEvents: yajuego.getLiveEvents,
            active: false
        }
    }

    const sports = {
        football: {
            active: true,
            market: footballMarket,
            name: "Futbol"
        },
        basketball: {
            active: false,
            market: basketballMarkets,
            name: "Baloncesto"
        },
        tennis: {
            active: false,
            market: tennisMarkets,
            name: "Tenis"
        }
    }

    const activeSports = Object.keys(sports).filter(v => sports[v].active)
    const activeBookmarkets = Object.keys(bookMarkets).filter(v => bookMarkets[v].active)

    let sportsData = {}
    for (let sport of activeSports) {
        for (let bookMarket of activeBookmarkets) {
            const data = await bookMarkets[bookMarket].getEvents(sport)
            if (sportsData[sport]) {
                sportsData[sport][bookMarket] = data
            } else {
                sportsData = {
                    ...sportsData,
                    [sport]: {
                        [bookMarket]: data
                    }
                }
            }
            console.log(`Partidos de ${sport} en ${bookMarket} ==> ${data.length}`)
        }
    }

    console.log(sportsData)

    const sportsMatches = {}
    for (let sportName of Object.keys(sportsData)) {
        const bookMarketsData = sportsData[sportName]
        const matchGroups = utilities.matchAllMatchesLive(bookMarketsData)
        sportsMatches[sportName] = matchGroups
    }

    console.log("Partidos con match => ", sportsMatches)

    for(sportName of Object.keys(sportsMatches)){
        const matchGroups = sportsMatches[sportName]
        for(let matchGroup of matchGroups){
          const bookMarketsNames = Object.keys(matchGroup)
          const promises = bookMarketsNames.map(bookMarket=> bookMarkets[bookMarket].getMatch(matchGroup[bookMarket], sports[sportName].market))
          const data = await Promise.all(promises)
          const bookMarketObject = bookMarketsNames.reduce((obj, bookMarket, index) => {
            return {
              ...obj,
              [bookMarket]: data[index]
            }
          },{})
         
          const surebetsData = surebets.compareMatches2(bookMarketObject, sports[sportName].market, sportName)
          console.log("YA")
    
          if(!surebetsData) continue
          console.log("hay Surbet")
      }
    }


}


export default {
    getLiveSurebets
}