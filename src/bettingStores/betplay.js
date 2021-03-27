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
  
  const addAllBetOffers2 = async (matches = []) => {
    const resultArray = [];
    for (let match of matches) {
      await delay(500);
      const data = await getBetOffersBetPlay(match.event.id);
      resultArray.push({ ...match, betOffers: data });
      console.log("YA");
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
      team2: match.event.awayName ? match.event.awayName : "",
      eventName: match.event.name,
      date_start: new Date(match.event.start).getTime()
    }));
  };
  
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
  
  export default {
    addAllBetOffers,
    formatBetsMarkets,
    getBetOffersBetPlay,
    getEventsBetPlay,
    formatBetOffer2,
    addAllBetOffers2,
    formatBetOffer3
  };
  