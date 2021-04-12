import React, { useState } from 'react';
import ReactDom from 'react-dom';


import SurebetCard from './components/SurebetCard'
import NavBar from './components/NavBar'
import Configuration from './components/Configuration'
import SurbetContainer from './components/SurebetCard/surbetContainer.js'


import utilities from './libs/utilities.js'
import surebets from './libs/surebets.js'




import markets from './markets.json'
import basketBallMarkets from './markets/markets-basketball.json'

//import textData from './textData.json'


import _ from 'lodash'
import betplay from './bettingStores/betplay.js';
import xbet from './bettingStores/xbet.js';
import yajuego from './bettingStores/yajuego.js';




const testXbet = async () => {
  console.log("Empezo esto!");
  //const data = await xbet.getEvents1Xbet2({ id: 89864715 }, markets);
  const data = await yajuego.getMatchData("4101239")
  console.log(data);
};

testXbet()

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




const testMatch = async (options, sportsOptions, cb, loadCb) => {

    const bookMarkets = {
      betplay:{
        getAll: betplay.getAllEventsFull,
        getMatch: betplay.getMatch,
        sports: {
          football:{
            getAll: betplay.getAllEventsFull,
            getMatch: betplay.getMatch,
            active: true,
          },
          basketball:{
            getAll: betplay.getAllEventsBasketBallFull,
            getMatch: betplay.getMatch,
            active: true,
          }
        },
        active: true
      },
      xbet:{
        getAll: xbet.getEvents1Xbet2,
        getMatch: xbet.getMatch,
        sports: {
          football:{
            getAll: xbet.getEvents1Xbet2,
            getMatch: xbet.getMatch,
            active: true,
          },
          basketball:{
            getAll: xbet.getBasketballEvents1Xbet,
            getMatch: xbet.getMatch,
            active: true,
          }
        },
        active: true
      },
      yajuego:{
        getAll: yajuego.getAllEvents,
        getMatch: yajuego.getMatch,
        sports: {
          football:{
            getAll: yajuego.getAllEvents,
            getMatch: yajuego.getMatch,
            active: true,
          },
          basketball:{
            getAll: yajuego.getAllBasketballEvents,
            getMatch: yajuego.getMatch,
            active: true,
          }
        },
        active: false
      }
    }

    const sports = {
      football:{
        active: true,
        market: markets,
        name: "Futbol"
      },
      basketball:{
        active: false,
        market: basketBallMarkets,
        name: "Baloncesto"
      }
    }
    

    Object.keys(options).forEach(bookMarket=>{
      bookMarkets[bookMarket].active = options[bookMarket].active
    })
    Object.keys(sportsOptions).forEach(sportName => {
      sports[sportName].active = sportsOptions[sportName].active
    })
    
    //consigo los partidos de cada casa de apuestas
    let sportsData = {}
    const activeBookMarkets = Object.keys(bookMarkets).filter(bookMarket => bookMarkets[bookMarket].active)
    const activeSports = Object.keys(sports).filter(sport=> sports[sport].active)

    for(let sport of activeSports){
      for(let bookMarket of activeBookMarkets){
        const data = await bookMarkets[bookMarket].sports[sport].getAll()
        if(sportsData[sport]){
          sportsData[sport][bookMarket] = data
        }else{
          sportsData = {
            ...sportsData,
            [sport]:{
              [bookMarket]:data
            }
          }
        }
        console.log(`Partidos de ${sport} en ${bookMarket} ==> ${data.length}`)
      }
    }


    console.log(sportsData)
    
    //crear un estandar para todas las casas en el que tengas las mismas funciones para
    //conseguir todos los partidos y para conseguir cada partido con los mercados formateados
    //de forma que todo se pueda hacer de forma mas programatica
    

    //matcheo los partios para hacer el match Group 
    const sportsMatches = {}
    for(let sportName of Object.keys(sportsData)){
      const bookMarketsData = sportsData[sportName]
      const matchGroups = utilities.matchAllMatches(bookMarketsData)
      sportsMatches[sportName] = matchGroups
    }
    
 

    console.log("Partidos con match => ", sportsMatches)


    
    let count = 0;
    const totalEvents = Object.keys(sportsMatches).reduce((count, sportName)=> sportsMatches[sportName].length + count ,0)

    //consigo y formateo los mercados de cada partido
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
  
        
      
        count += 1;
        loadCb && loadCb({
          loading: true,
          total: totalEvents,
          count: count,
          progress: (count * 100) / totalEvents,
          message: `Analizando los partidos ${sports[sportName].name}`,
          extra: matchGroup[bookMarketsNames[0]].eventName
        })
  
  
        if(!surebetsData) continue
        cb(v => [...surebetsData, ...v])
      }
    }
    
    //Se terminaron todas las comparaciones
    loadCb && loadCb({ loading: false })

}


// ---------------------------------------------------------- ESTA ES LA PARTE VISUAL -------------------------------------------------------



const App = (props) => {

  const [surebets, setSurebets] = useState([])
  const [load, setLoad] = useState(0)
  const [disabledActions, setDisabledActions] = useState(false)
  const [bookMarkets, setBookMarkets] = useState({
    betplay:{
      active: true,
      name: "BetPlay"
    },
    xbet:{
      name: "1xBet",
      active: true
    },
    yajuego:{
      name: "Yajuego",
      active: false
    }
  })

  const [sports, setSports] = useState({
    football:{
      name: "Futbol",
      active: true,
    },
    basketball:{
      name: "Baloncesto",
      active: false,
    }
  })

  const handleClick = async () => {
    setDisabledActions(true)
    await testMatch(bookMarkets,sports, setSurebets, (loadObject) => {
      setLoad(loadObject)
    })
    setDisabledActions(false)
  }


  const handleChangeOption = (stateFunction) => (bookMarket)=>(e)=>{
    stateFunction(bm=>({
      ...bm,
      [bookMarket]:{
        ...bm[bookMarket],
        active: e.target.checked
      }
    }))
  }

  return (
    <div>
      <NavBar disabledActions={disabledActions} onClick={handleClick} />
      <div className="columns">
        <div className="column is-3">
          <Configuration
            onChangeBookMarkets={handleChangeOption(setBookMarkets)}
            onChangeSports={handleChangeOption(setSports)} 
            bookMarkets={bookMarkets} 
            sports={sports}
            loadData={load}/>
        </div>
        <div className="column">
          <SurbetContainer>
            {
              surebets.map((surebet, index) => (
                <SurebetCard sports={sports} key={index} data={surebet} />
              ))
            }
          </SurbetContainer>
        </div>
        

      </div>
    </div>
  )
}



ReactDom.render(<App />, document.getElementById('root'))