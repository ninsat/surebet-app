const getBetOffersBetPlay = async (id) => {
  var myHeaders = new Headers();
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append(
    "sec-ch-ua",
    '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"'
  );
  myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append(
    "User-Agent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
  );
  myHeaders.append("Origin", "https://betplay.com.co");
  myHeaders.append("Sec-Fetch-Site", "cross-site");
  myHeaders.append("Sec-Fetch-Mode", "cors");
  myHeaders.append("Sec-Fetch-Dest", "empty");
  myHeaders.append("Referer", "https://betplay.com.co/");
  myHeaders.append("Accept-Language", "es-419,es;q=0.9,en;q=0.8");

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const res = await fetch(
    `https://us1-api.aws.kambicdn.com/offering/v2018/betplay/betoffer/event/${id}.json?lang=es_ES&market=CO`,
    requestOptions
  );
  const data = await res.json();
  return data.betOffers;
};

const addAllBetOffers = (matches = []) => {
  let index = 0;
  const resultArray = [];
  return new Promise((res, rej) => {
    const timer = setInterval(async () => {
      const data = await getBetOffersBetPlay(matches[index].event.id);
      console.log("YA");
      resultArray.push({ ...matches[index], betOffers: data });
      index += 1;
      if (index === 200) {
        clearInterval(timer);
        console.log("termino");
        res(resultArray);
      }
    }, 300);
  });
};

const delay = (time) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res({ message: "done" });
    }, time);
  });
};

const addAllBetOffers2 = async (matches = [], cb) => {
  const resultArray = [];
  let count = 0;
  for (let match of matches) {
    await delay(300);
    if(!match.event?.id) continue
    const data = await getBetOffersBetPlay(match.event.id);
    resultArray.push({ ...match, betOffers: data });
    console.log("YA");
    count += 1;
    cb && cb({
      loading: true,
      progress: (count * 100) / matches.length,
      message: "Analizando los partidos de BetPlay",
      extra: match.event.name
    })
  }
  return resultArray;
};

const getEventsBetPlay = async () => {

  const myHeaders = new Headers();
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append(
    "sec-ch-ua",
    '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"'
  );
  myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append(
    "User-Agent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
  );
  myHeaders.append("Origin", "https://betplay.com.co");
  myHeaders.append("Sec-Fetch-Site", "cross-site");
  myHeaders.append("Sec-Fetch-Mode", "cors");
  myHeaders.append("Sec-Fetch-Dest", "empty");
  myHeaders.append("Referer", "https://betplay.com.co/");
  myHeaders.append("Accept-Language", "es-419,es;q=0.9,en;q=0.8");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const res = await fetch(
    `https://us1-api.aws.kambicdn.com/offering/v2018/betplay/listView/football.json?lang=es_ES&market=CO&client_id=2&channel_id=1&ncid=${new Date().getTime()}&useCombined=true`,
    requestOptions
  );

  const data = await res.json();

  return data.events.map(match => ({
    ...match,
    id: match.event.id,
    team1: match.event.homeName,
    team1En: match.event.englishName.split(" " + match.event.nameDelimiter + " ").map(v => v.trim())[0],
    team2: match.event.awayName ? match.event.awayName : "",
    team2En: match.event.englishName.split(" " + match.event.nameDelimiter + " ").map(v => v.trim())[1],
    eventName: match.event.name,
    date_start: new Date(match.event.start).getTime(),
    sport: match.event.sport,
    group: match.event.group,
    url: `https://www.rushbet.co/?page=sportsbook#event/${match.event.id}` 
  }));
};




const getBasketballEventsBetPlay = async () => {

  const myHeaders = new Headers();
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append(
    "sec-ch-ua",
    '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"'
  );
  myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append(
    "User-Agent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
  );
  myHeaders.append("Origin", "https://betplay.com.co");
  myHeaders.append("Sec-Fetch-Site", "cross-site");
  myHeaders.append("Sec-Fetch-Mode", "cors");
  myHeaders.append("Sec-Fetch-Dest", "empty");
  myHeaders.append("Referer", "https://betplay.com.co/");
  myHeaders.append("Accept-Language", "es-419,es;q=0.9,en;q=0.8");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const res = await fetch(
    `https://us1-api.aws.kambicdn.com/offering/v2018/betplay/listView/basketball.json?lang=es_ES&market=CO&client_id=2&channel_id=1&ncid=${new Date().getTime()}&useCombined=true`,
    requestOptions
  );

  const data = await res.json();

  return data.events.map(match => ({
    ...match,
    id: match.event.id,
    team1: match.event.homeName,
    team1En: match.event.englishName.split(" " + match.event.nameDelimiter + " ").map(v => v.trim())[0],
    team2: match.event.awayName ? match.event.awayName : "",
    team2En: match.event.englishName.split(" " + match.event.nameDelimiter + " ").map(v => v.trim())[1],
    eventName: match.event.name,
    date_start: new Date(match.event.start).getTime(),
    sport: match.event.sport,
    group: match.event.group,
    url: `https://www.rushbet.co/?page=sportsbook#event/${match.event.id}` 
  }));
};

const getCountryMatches = async (country = "france", sport="football") => {
  const myHeaders = new Headers();
  myHeaders.append("Connection", "keep-alive");
  myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"89\", \"Chromium\";v=\"89\", \";Not A Brand\";v=\"99\"");
  myHeaders.append("Accept", "application/json, text/javascript, */*; q=0.01");
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36");
  myHeaders.append("Origin", "https://betplay.com.co");
  myHeaders.append("Sec-Fetch-Site", "cross-site");
  myHeaders.append("Sec-Fetch-Mode", "cors");
  myHeaders.append("Sec-Fetch-Dest", "empty");
  myHeaders.append("Referer", "https://betplay.com.co/");
  myHeaders.append("Accept-Language", "es-419,es;q=0.9,en;q=0.8");

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  const res = await fetch(`https://us1-api.aws.kambicdn.com/offering/v2018/betplay/listView/${sport}/${country}/all.json?lang=es_ES&market=CO&client_id=2&channel_id=1&ncid=${new Date().getTime()}&useCombined=true`, requestOptions)
  const data = await res.json()
  return data.events.map(match => ({
    ...match,
    id: match.event.id,
    team1: match.event.homeName,
    team1En: match.event.englishName.split(" " + match.event.nameDelimiter + " ").map(v => v.trim())[0],
    team2: match.event.awayName ? match.event.awayName : "",
    team2En: match.event.englishName.split(" " + match.event.nameDelimiter + " ").map(v => v.trim())[1],
    eventName: match.event.name,
    date_start: new Date(match.event.start).getTime(),
    sport: match.event.sport,
    group: match.event.group,
    url: `https://www.rushbet.co/?page=sportsbook#event/${match.event.id}` 
  }));

}


const getAllEventsFull = async () =>{
  const countries = [
    "colombia",
    "copa_sudamericana",
    "england",
    "copa_libertadores",
    "spain",
    "france",
    "italy",
    "germany",
    "argentina",
    "champions_league",
    "europa_league",
    "portugal",
    "netherlands",
    "brazil",
    "mexico",
    "usa",
    "international_friendly_matches__w_",
    "saudi_arabia",
    "australia",
    "austria",
    "bolivia",
    "bulgaria",
    "belgium",
    "uefa_championship_u21",
    "concacaf_champions_league",
    "copa_america"
  ]

  const countriesPromises = countries.map(country => getCountryMatches(country))
  const countriesData = await Promise.all(countriesPromises)
  const firsData = countriesData.reduce((arr, option)=> [...arr, ...option], [])
  const secondData = await getEventsBetPlay()

  firsData.forEach(match => {
    const cloneIndex = secondData.findIndex(v => v.id === match.id)
    if(cloneIndex === -1) return
    secondData.splice(cloneIndex,1)
  })

  return [...firsData, ...secondData]

}



const getAllEventsBasketBallFull = async () =>{
  const countries = [
    "nba",
    "euroleague",
    "eurocup",
    "spain",
    "germany",
    "australia",
    "belgium",
    "denmark",
    "estonia",
    "finland",
    "france",
    "israel",
    "ncaab",
    "poland",
    "romania",
    "turkey",
    "vtb_united_league",
    "wnba"
  ]

  const countriesPromises = countries.map(country => getCountryMatches(country, "basketball"))
  const countriesData = await Promise.all(countriesPromises)
  const firsData = countriesData.reduce((arr, option)=> [...arr, ...option], [])
  const secondData = await getBasketballEventsBetPlay()
  firsData.forEach(match => {
    const cloneIndex = secondData.findIndex(v => v.id === match.id)
    if(cloneIndex === -1) return
    secondData.splice(cloneIndex,1)
  })

  return [...firsData, ...secondData]

}

const formatBetOffer = (match, market) => {
  return match.betOffers
    .filter((v) => v.criterion.id === market.id)
    .map((betofer) => {
      return {
        type: betofer.outcomes[0].line / 1000,
        over: {
          v: betofer.outcomes.find((v) => v.type === "OT_OVER").odds / 1000
        },
        under: {
          v: betofer.outcomes.find((v) => v.type === "OT_UNDER").odds / 1000
        }
      };
    });
};

const formatBetOffer2 = (match, markets) => {
  return markets.reduce((obj, market) => {
    const betOffer = match.betOffers.filter(
      (v) => v.criterion.id === market.id
    );

    if (!betOffer.length) return obj;

    const formatOffers = betOffer.map((betofer) => {
      return {
        type: betofer.outcomes[0].line / 1000,
        over: {
          v: betofer.outcomes.find((v) => v.type === "OT_OVER").odds / 1000
        },
        under: {
          v: betofer.outcomes.find((v) => v.type === "OT_UNDER").odds / 1000
        }
      };
    });

    return {
      ...obj,
      [market.name]: formatOffers
    };
  }, {});
};

const formatBetOffer3 = (match, markets) => {
  return markets.reduce((obj, market) => {

    if(!match.betOffers) return obj

    const betOffer = match.betOffers.filter(
      (v) => v.criterion.id === market.id
    );

    if (!betOffer.length) return obj;


    if (market.type === "OVER/UNDER") {
      const formatOffers = betOffer.map((betofer) => {
        return {
          type: betofer.outcomes[0].line / 1000,
          over: {
            v: betofer.outcomes.find((v) => v.type === "OT_OVER").odds / 1000
          },
          under: {
            v: betofer.outcomes.find((v) => v.type === "OT_UNDER").odds / 1000
          }
        };
      });

      return {
        ...obj,
        [market.name]: formatOffers
      };
    } else if (market.type === "OBJECT") {
      const options = Object.keys(market.options);
      const formatOffers = options.reduce((merketObj, option) => {
        return {
          ...merketObj,
          [option]: {
            v:
              betOffer[0].outcomes.find(
                (v) => v.type === market.options[option].betplay.type
              ).odds / 1000
          }
        };
      }, {});
      return {
        ...obj,
        [market.name]: formatOffers
      };
    } else if (market.type === "HANDICAP") {
      const outcomes = betOffer.reduce((arr, option) => [...arr, ...option.outcomes], [])
      const formatOffers = outcomes.reduce((marketArr, option) => {
        const isTheLine = marketArr.findIndex(v => v.type === option.line / 1000) !== -1
        if (isTheLine) return marketArr
        const lineOptions = outcomes.filter(v => v.line === option.line)
        const homeOdds = lineOptions.find(v => v.participant === match[market.betplay.home])?.odds / 1000
        const awayOdds = lineOptions.find(v => v.participant === match[market.betplay.away])?.odds / 1000

        return [...marketArr, {
          type: option.line / 1000,
          home: {
            v: homeOdds
          },
          away: {
            v: awayOdds
          }
        }]

      }, [])
      return {
        ...obj,
        [market.name]: formatOffers
      }

    } else if (market.type === "OBJECT-PARTICIPANT") {
      //aqui va el formateo para los mercados que conienen participants.
      // un ejemplo es: Fulanito marcara YES/NO
      const formatOffers = betOffer.map((outcomeContainer) => {
        const options = Object.keys(market.options);
        const arrayObject = options.reduce((merketObj, option) => {
          return {
            ...merketObj,
            [option]: {
              v: outcomeContainer.outcomes.find(v => v.type === market.options[option].betplay.type)?.odds / 1000
            }
          };
        }, { participant: outcomeContainer.outcomes[0].participant });
        return arrayObject
      })

      return {
        ...obj,
        [market.name]: formatOffers
      }
    }

    return obj;
  }, {});
};

const formatBetsMarkets = (array = []) => {
  return array.map((match) => {
    //1001159926 = ID de total de goles
    const totals = formatBetOffer(match, 1001159926);
    const totalsAsian = formatBetOffer(match, "Total asiático");
    const bet = match.betOffers.find(
      (v) => v.criterion.label === "Ambos Equipos Marcarán"
    );
    const bothToScore = {
      yes: {
        v: bet?.outcomes.find((v) => v.type === "OT_YES").odds / 1000
      },
      no: {
        v: bet?.outcomes.find((v) => v.type === "OT_NO").odds / 1000
      }
    };

    return {
      ...match,
      markets: {
        totals,
        bothToScore,
        totalsAsian
      }
    };
  });
};


const getMatch = async(match, markets) => {
  const betOffers = await getBetOffersBetPlay(match.id);
  const matchData = { ...match, betOffers }
  const marketsData = formatBetOffer3(matchData, markets)
  return {...matchData, markets: marketsData }
}

export default {
  addAllBetOffers,
  formatBetsMarkets,
  getBetOffersBetPlay,
  getEventsBetPlay,
  formatBetOffer2,
  addAllBetOffers2,
  formatBetOffer3,
  getCountryMatches,
  getAllEventsFull,
  getMatch,
  getBasketballEventsBetPlay,
  getAllEventsBasketBallFull
};
