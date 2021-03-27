const getEvents1Xbet = async () => {
    const myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "acd79533253d4d70a6b2b5346d504f60c1b11b7f026f4c1687898a60e2ea3040"
    );
  
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };
  
    const res = await fetch(
      "https://cors-anywhere.herokuapp.com/https://api.betting-api.com/1xbet/football/line/all",
      requestOptions
    );
    const data = await res.json();
    return data;
  };
  
  const getBetOfferceXbet = async (id) => {
    const myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "acd79533253d4d70a6b2b5346d504f60c1b11b7f026f4c1687898a60e2ea3040"
    );
  
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };
  
    const res = await fetch(
      `https://api.betting-api.com/1xbet/football/match/${id}`,
      requestOptions
    );
    const data = await res.json();
  
    return data;
  };
  
  const getEvents1Xbet2 = async () => {
    var requestOptions = {
      method: "GET"
    };


    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://1xbet.com.co/LineFeed/Get1x2_VZip?sports=1&count=1000&lng=es&tf=2200000&tz=-5&mode=4&country=1&getEmpty=true')}`)
    if(!response.ok) throw new Error('Network response was not ok.')

    const responseData = await response.json()

    /*
    const res = await fetch(
      "https://cors-anywhere.herokuapp.com/https://1xbet.com.co/LineFeed/Get1x2_VZip?sports=1&count=1000&lng=es&tf=2200000&tz=-5&mode=4&country=1&getEmpty=true",
      requestOptions
    );
    */
    const data = JSON.parse(responseData.contents);
    return data.Value.map((match) => ({
      id: match.CI,
      team1: match.O1,
      team2: match.O2 ? match.O2 : "",
      eventName: match.O1 + " - " + match.O2,
      date_start: match.S * 1000,
      sport: match.SE
    }));
  };
  
  const getmarket = async (id) => {
    const myHeaders = new Headers();
    myHeaders.append("authority", "1xbet.com.co");
    myHeaders.append(
      "sec-ch-ua",
      '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"'
    );
    myHeaders.append("accept", "*/*");
    myHeaders.append(
      "user-agent",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
    );
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("accept-language", "es-419,es;q=0.9,en;q=0.8");
  
    var requestOptions = {
      method: "GET",
      headers: myHeaders
    };
    const url = encodeURIComponent(`https://1xbet.com.co/LineFeed/GetGameZip?id=${id}&lng=es&cfview=0&isSubGames=true&GroupEvents=true&allEventsGroupSubGames=true&countevents=250&marketType=1`)
    const response = await fetch(`https://api.allorigins.win/get?url=${url}`)
 
	  if (!response.ok) throw new Error('Network response was not ok.')
	  
    const data = await response.json()

    return JSON.parse(data.contents).Value;

    /*
    const url = encodeURIComponent('https://1xbet.com.co/LineFeed/GetGameZip?id=89864715&lng=es&cfview=0&isSubGames=true&GroupEvents=true&allEventsGroupSubGames=true&countevents=250&marketType=1')
    const res = await fetch(
      `https://api.allorigins.win/get?url=${url}`,
      requestOptions
    );
    const data = await res.json();
    return JSON.parse(data.contents).Value;
    */
  };
  
  const getBetOfferceXbet2 = async (match, markets = []) => {
    //consigo el mercado principal que es el que contiene los ids de los demas mercados
    const mainMarket = await getmarket(match.id);
  
    if(!mainMarket){
      return {
        ...match,
        markets: {}
      };
    }

    if(!mainMarket.SG){
      mainMarket.SG = []
    }
    //mapeo el mercado para que me quden los ids de los mercdos con los nombres
    //para poder identificarlos
    //ejemplo tiros-entre-los-tres-palos
  
    const allMarkets = mainMarket.SG.map((m) => ({
      id: m.CI,
      label: (m.TG ? m.TG : "") + (m.PN ? ` ${m.PN}` : ""),
      textId: ((m.TG ? m.TG : "") + (m.PN ? ` ${m.PN}` : ""))
        .trim()
        .replaceAll(" ", "-")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    }));
  
    //filtro solo los mercados que me interesan que estan en el archivo markets.json
    const filterMarkets = allMarkets.filter(
      (m) => markets.findIndex((v) => v.xbet.marketId === m.textId) >= 0
    );
    
    //creo las promesas para traerme todos los mercados
    const marketPromises = filterMarkets.map((m) => getmarket(m.id));
  
    //consigo todos los mercados
    const fullMarkets = await Promise.all(marketPromises);
  
    //mezvlo los mercados con el partido, ya esta listo para darle el mismo formato
    //que en betplay, ahora si empieza lo bueno
    const readyToFormat = filterMarkets.reduce(
      (obj, market) => {
        return {
          ...obj,
          [market.textId]: fullMarkets.find((v) => v.CI === market.id).GE
        };
      },
      { main: mainMarket.GE }
    );
  
    //formatear los datos con los mercados que se especifican en market.json
    const formatedMarkets = markets.reduce((obj, market) => {
      const marketObject = readyToFormat[market.xbet.marketId];
      if (!marketObject) return obj;
      const actualMarket = marketObject.find((v) => v.G === market.xbet.G);
  
      if (!actualMarket) return obj;
      
      if (market.type === "OVER/UNDER") {
        const actualMarketFormated = actualMarket.E[0].map((odd) => {
          return {
            type: odd.P,
            over: {
              v: odd.C
            },
            under: {
              v: actualMarket.E[1].find((v) => v.P === odd.P).C
            }
          };
        });
  
        return {
          ...obj,
          [market.name]: actualMarketFormated
        };
      } else if (market.type === "OBJECT") {
        const options = Object.keys(market.options);
        const actualMarketFormated = options.reduce((marketObject, option) => {
          return {
            ...marketObject,
            [option]: {
              v: actualMarket.E.find(
                (v) =>
                  v.findIndex((op) => op.T === market.options[option].xbet.T) >= 0
              )?.find((op) => op.T === market.options[option].xbet.T).C
            }
          };
        }, {});
        return {
          ...obj,
          [market.name]: actualMarketFormated
        };
      }
  
      return obj;
    }, {});
  
    return {
      ...match,
      markets: formatedMarkets
    };
  };
  
  export default {
    getEvents1Xbet,
    getBetOfferceXbet,
    getEvents1Xbet2,
    getBetOfferceXbet2,
    getmarket
  };
  