import utilities from './libs/utilities.js'
import surebets from './libs/surebets.js'
import betplay from './bettingStores/betplay.js'
import xbet from './bettingStores/xbet.js'
import markets from './markets.json'

const button = document.getElementById("btn")


button.addEventListener("click", ()=>{
    console.log("CLICK!");
    secondMain();
    //testXbet();
})


const testXbet = async () => {
    console.log("Empezo esto!");
    const data = await xbet.getEvents1Xbet2({ id: 89864715 }, markets);
    console.log(data);
  };
  
  // Segundo intento de conseguir los matches
  const secondMain = async () => {
    //Obtengo todos los partidos de BetPlay
    const betPlayArray = await betplay.getEventsBetPlay();
    console.log(betPlayArray.length);
  
    //Agrego todas las ofertas de mercados a cada partido
    //ya que en la anterior peticion solo vienen con 1X2 y unde/over 2.5
    const fullBetPlayArray = await betplay.addAllBetOffers2(betPlayArray);
    console.log("Se consiguieron todas los mercados")
    //Filtro los partidos para quedarme con los que tienen
    //los mercados espesificados en el archivo market.json
    //estos son los mercados mas frecuentes en los que se encuentran surebets

    const matchWithMarkets = fullBetPlayArray.filter((match) => {
      const isMarket = markets
        .filter((v) => v.enable)
        .findIndex(
          (market) =>
            match.betOffers?.findIndex((v) => v.criterion.id === market.id) >= 0
        );
      return isMarket >= 0;
    });
  
    //Formateo los mercados de los partidos para tener una misma estructura de datos
    // y que se facilite la comparacion mas adelante
    //se crea un objeto markets con los mercados espesificados en el archivo market.json
    console.log("formateado mercados de betplay...")
    const formatBetplayData = matchWithMarkets.map((match) => {
      return {
        ...match,
        markets: betplay.formatBetOffer3(match, markets)
      };
    });
    console.log(formatBetplayData);
  
    //obtengo los datos de 1XBet
    console.log("Obteniendo todos los eventos de 1XBet...")
    const xbetArray = await xbet.getEvents1Xbet2();
    
    //Encuentro los partidos filtrados de betplay en 1XBet para crear las parejas
    console.log("empieza la comparacion");
    const matchesPairs = utilities.findSameMatches(formatBetplayData, xbetArray);
    console.log(matchesPairs);
  
    //Agrego todos los mercados a los partidos de 1Xbet, sobre todo los mercados de tiros a puerta
    //Formateo los partidos de 1Xbet para que queden  se maneja la misma estructura de datos
    console.log("Buscando todos los mercados de 1XBET...");
    const result = [];
    for (let match of matchesPairs) {
      const fullBetOffers = await xbet.getBetOfferceXbet2(match.xbet, markets);
      result.push({ ...match, xbet: fullBetOffers });
      //await utilities.delay(3500);
      console.log("YA");
    }
    console.log(result);
  
    //Comparo todos los mercados para ver si se encuentra una surbet en alguno de los partidos
    //Hay que mostrar el partido en que se encuentra, el mercado, y que cuota debo seleccionar
    //para cada casa de apuestas
    const allSurebets = result.reduce((res , matchGroup) => {
      const data = surebets.compareMatches2(matchGroup, markets)
      if(!data) return res
      return [...res, ...data]
    }, []);
    
    console.log(allSurebets);
  };
  