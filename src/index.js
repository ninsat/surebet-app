import React, { useState } from 'react';
import ReactDom from 'react-dom';


import SurebetCard from './components/SurebetCard'
import NavBar from './components/NavBar'
import ProgressBar from './components/ProgressBar'


import utilities from './libs/utilities.js'
import surebets from './libs/surebets.js'
import markets from './markets.json'


//import textData from './textData.json'


import _ from 'lodash'
import betplay from './bettingStores/betplay.js';
import xbet from './bettingStores/xbet.js';
import yajuego from './bettingStores/yajuego.js';




const testXbet = async () => {
  console.log("Empezo esto!");
  //const data = await xbet.getEvents1Xbet2({ id: 89864715 }, markets);
  const data = await betplay.getCountryMatches("colombia")
  console.log(data);
};


// Segundo intento de conseguir los matches
const secondMain = async (cb) => {
  //Obtengo todos los partidos de BetPlay
  const betPlayArray = await betplay.getAllEventsFull();
  console.log(betPlayArray.length);

  //Agrego todas las ofertas de mercados a cada partido
  //ya que en la anterior peticion solo vienen con 1X2 y unde/over 2.5
  const fullBetPlayArray = await betplay.addAllBetOffers2(betPlayArray, (loadinData) => {
    cb && cb(loadinData)
  });
  console.log("Se consiguieron todas los mercados")
  cb && cb({ loading: false })
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
  let count = 0;
  for (let match of matchesPairs) {
    const fullBetOffers = await xbet.getBetOfferceXbet2(match.xbet, markets);
    result.push({ ...match, xbet: fullBetOffers });
    //await utilities.delay(3500);
    console.log("YA");
    count += 1;
    cb && cb({
      loading: true,
      progress: (count * 100) / matchesPairs.length,
      message: "Analizando los partidos de 1XBet",
      extra: match.xbet.eventName
    })
  }
  console.log(result);

  //Comparo todos los mercados para ver si se encuentra una surbet en alguno de los partidos
  //Hay que mostrar el partido en que se encuentra, el mercado, y que cuota debo seleccionar
  //para cada casa de apuestas
  const allSurebets = result.reduce((res, matchGroup) => {
    const data = surebets.compareMatches2(matchGroup, markets)
    if (!data) return res
    return [...res, ...data]
  }, []);

  cb && cb({ loading: false })
  console.log(allSurebets);

  return allSurebets.reduce((arr, surebet) => {
    const isInTeArray = arr.findIndex(v => _.isEqual(v, surebet)) !== -1;
    if (isInTeArray) return arr;
    return [...arr, surebet]
  }, [])
};




const testMatch = async (cb, loadCb) => {

    const bookMarkets = {
      betplay:{
        getAll: betplay.getAllEventsFull,
        getMatch: betplay.getMatch,
        list:[],
        active: true
      },
      xbet:{
        getAll: xbet.getEvents1Xbet2,
        getMatch: xbet.getMatch,
        list: [],
        active: true
      },
      yajuego:{
        getAll: yajuego.getAllEvents,
        getMatch: yajuego.getMatch,
        list: [],
        active: false
      }
    }

    
    
    //consigo los partidos de cada casa de apuestas
    const bookMarketsData = {}
    const activeBookMarkets = Object.keys(bookMarkets).filter(bookMarket => bookMarkets[bookMarket].active)
    for(let bookMarket of activeBookMarkets){
      const data = await bookMarkets[bookMarket].getAll()
      bookMarketsData[bookMarket] = data
      console.log(`Partidos de ${bookMarket} ==> ${data.length}`)
    }

    
    //crear un estandar para todas las casas en el que tengas las mismas funciones para
    //conseguir todos los partidos y para conseguir cada partido con los mercados formateados
    //de forma que todo se pueda hacer de forma mas programatica
    

    //matcheo los partios para hacer el match Group 
    const matchGroups = utilities.matchAllMatches(bookMarketsData)

    console.log("Partidos con match => ", matchGroups)


    //consigo y formateo los mercados de cada partido
    let count = 0;
    const bookMarketObjectsList = []
    for(let matchGroup of matchGroups){
      const bookMarketsNames = Object.keys(matchGroup)
      const promises = bookMarketsNames.map(bookMarket=> bookMarkets[bookMarket].getMatch(matchGroup[bookMarket], markets))
      const data = await Promise.all(promises)
      const bookMarketObject = bookMarketsNames.reduce((obj, bookMarket, index) => {
        return {
          ...obj,
          [bookMarket]: data[index]
        }
      },{})
      bookMarketObjectsList.push(bookMarketObject)


      const surebetsData = surebets.compareMatches2(bookMarketObject, markets)
      console.log("YA")

      
    
      count += 1;
      loadCb && loadCb({
        loading: true,
        progress: (count * 100) / matchGroups.length,
        message: "Analizando los partidos",
        extra: matchGroup[bookMarketsNames[0]].eventName
      })


      if(!surebetsData) continue
      cb(v => [...surebetsData, ...v])
    }


}


// ---------------------------------------------------------- ESTA ES LA PARTE VISUAL -------------------------------------------------------



const App = (props) => {

  const [surebets, setSurebets] = useState([])
  const [load, setLoad] = useState(0)
  const [disabledActions, setDisabledActions] = useState(false)

  const handleClick = async () => {
    setDisabledActions(true)
    await testMatch(setSurebets, (loadObject) => {
      setLoad(loadObject)
    })
    setDisabledActions(false)
    /*
    const data = await secondMain((loadObject) => {
      setLoad(loadObject)
    })
    setSurebets(data)
    */
  }

  return (
    <div>
      <NavBar disabledActions={disabledActions} onClick={handleClick} />
      <ProgressBar data={load} />
      {
        surebets.map((surebet, index) => (
          <SurebetCard key={index} data={surebet} />
        ))
      }
    </div>
  )
}



ReactDom.render(<App />, document.getElementById('root'))