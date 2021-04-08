import stringSimilarity from "string-similarity";
import _ from 'lodash'
//paso un partido de betPlay para que encuentre el mismo partido pero en 1XBet
//match = partido de betplay
// matches = arreglo de partidos de 1XBET
// me devuelve un objeto con los dos partidos de cada casa de apuesta
//en caso de que no lo encuentre devuelve undefine



const matchTheMatch = (match, matches = []) => {
  const matchDate = new Date(match.event.start).getTime();
  const sameDateMatches = matches.filter(
    (v) => new Date(v.date_start).getTime() === matchDate
  );
  
  
  if(!sameDateMatches.length){
    return undefined;
  } 

  const sameDateMatcheNames = sameDateMatches.map(m => m.team1.toLocaleLowerCase())
  const {bestMatchIndex, bestMatch} =  stringSimilarity.findBestMatch(match.event.homeName.toLocaleLowerCase(), sameDateMatcheNames)

  const sameDateMatcheNamesEnglish = sameDateMatches.map(m => m.team1En.toLocaleLowerCase())
  const {bestMatchIndex:bestMatchIndexEnglish, bestMatch:bestMatchEnglish} =  stringSimilarity.findBestMatch(match.team1En.toLocaleLowerCase(), sameDateMatcheNamesEnglish)
  
  let actualMatch = undefined
  //primero comparo los nombres en ingles y sino encuentra coincidencia comparo los nombres en español
  if(bestMatchEnglish.rating >= 0.25){
    actualMatch = sameDateMatches[bestMatchIndexEnglish]
  } else if(bestMatch.rating >= 0.25){
    actualMatch = sameDateMatches[bestMatchIndex]
  } 



  if (actualMatch === undefined) {
    const eventListNames = sameDateMatches.map(m => m.eventName.toLocaleLowerCase())
    const matchObject = stringSimilarity.findBestMatch(match.eventName.toLocaleLowerCase(), eventListNames)
    if(matchObject.bestMatch.rating >= 0.5){
      return {
        betplay: match,
        xbet: sameDateMatches[matchObject.bestMatchIndex]
      };
    }
    return undefined;
  }

  const secontTeamEqual =
    stringSimilarity.compareTwoStrings(
      match.event.awayName.toLocaleLowerCase(),
      actualMatch.team2.toLocaleLowerCase()
    ) >= 0.2;

  const secontTeamEqualEnglish =
    stringSimilarity.compareTwoStrings(
      match.team1En.toLocaleLowerCase(),
      actualMatch.team2En.toLocaleLowerCase()
    ) >= 0.2;

  if (!secontTeamEqual && !secontTeamEqualEnglish) {
    return undefined;
  }

  return {
    betplay: match,
    xbet: actualMatch
  };
};




const matchTheMatchFull = (match, matches = [], name1, name2) => {
  
  
  const matchDate = new Date(match.date_start).getTime();
  const sameDateMatches = matches.filter(
    (v) => new Date(v.date_start).getTime() === matchDate
  );
  
  
  if(!sameDateMatches.length){
    return undefined;
  } 

  const sameDateMatcheNames = sameDateMatches.map(m => m.team1.toLocaleLowerCase())
  const {bestMatchIndex, bestMatch} =  stringSimilarity.findBestMatch(match.team1.toLocaleLowerCase(), sameDateMatcheNames)

  const sameDateMatcheNamesEnglish = sameDateMatches.map(m => m.team1En.toLocaleLowerCase())
  const {bestMatchIndex:bestMatchIndexEnglish, bestMatch:bestMatchEnglish} =  stringSimilarity.findBestMatch(match.team1En.toLocaleLowerCase(), sameDateMatcheNamesEnglish)
  
  let actualMatch = undefined
  //primero comparo los nombres en ingles y sino encuentra coincidencia comparo los nombres en español
  if(bestMatchEnglish.rating >= 0.25){
    actualMatch = sameDateMatches[bestMatchIndexEnglish]
  } else if(bestMatch.rating >= 0.25){
    actualMatch = sameDateMatches[bestMatchIndex]
  } 



  if (actualMatch === undefined) {
    const eventListNames = sameDateMatches.map(m => m.eventName.toLocaleLowerCase())
    const matchObject = stringSimilarity.findBestMatch(match.eventName.toLocaleLowerCase(), eventListNames)
    if(matchObject.bestMatch.rating >= 0.5){
      return {
        [name1]: match,
        [name2]: sameDateMatches[matchObject.bestMatchIndex]
      };
    }
    return undefined;
  }

  const secontTeamEqual =
    stringSimilarity.compareTwoStrings(
      match.team2.toLocaleLowerCase(),
      actualMatch.team2.toLocaleLowerCase()
    ) >= 0.2;

  const secontTeamEqualEnglish =
    stringSimilarity.compareTwoStrings(
      match.team1En.toLocaleLowerCase(),
      actualMatch.team2En.toLocaleLowerCase()
    ) >= 0.2;

  if (!secontTeamEqual && !secontTeamEqualEnglish) {
    return undefined;
  }

  return {
    [name1]: match,
    [name2]: actualMatch
  };
};

const findSameMatches2 = (bookMarket1, bookMarket2, bookMarkets) => {
  const result = [];
  bookMarkets[bookMarket1].forEach((match) => {
    const data = matchTheMatchFull(match, bookMarkets[bookMarket2], bookMarket1, bookMarket2);
    if (!!data) {
      result.push(data);
    }
  });
  return result;
};

const findSameMatches = (bookMarket1, bookMarket2) => {
  const result = [];
  bookMarket1.forEach((match) => {
    const data = matchTheMatch(match, bookMarket2);
    if (!!data) {
      result.push(data);
    }
  });
  return result;
};

const delay = (time) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res({ message: "done" });
    }, time);
  });
};

const getRoute = (object, route) =>
  route.split(".").reduce((r, currentLocation) => {
    return r[currentLocation] ? r[currentLocation] : {};
  }, object);




  const matchAllMatches = (bookMarkets) => {
    console.log(bookMarkets);
    const bookMarketsNames = Object.keys(bookMarkets);
    const bookMarketsNamesCopy = bookMarketsNames.slice();
    const matchesData = [];
    bookMarketsNames.forEach((bookMarketName) => {
      //para cada casa de apuestas la compara con las otras
      bookMarketsNamesCopy.forEach((compareBookMarketName) => {
        if (bookMarketName === compareBookMarketName) return;
        console.log(`Comparando ${bookMarketName} con ${compareBookMarketName}`);
        const res = findSameMatches2(
          bookMarketName,
          compareBookMarketName,
          bookMarkets
        );
        matchesData.push(res);
      });
      const bookMarketIndex = bookMarketsNamesCopy.indexOf(bookMarketName);
      bookMarketsNamesCopy.splice(bookMarketIndex, 1);
    });
  
    const mergeData = matchesData.reduce((arr, op) => [...arr, ...op], []);
    const mergeDataCopy = mergeData.slice();
  
    const filterData = mergeData.reduce((arr, matchGroup) => {
      const bookMarkets = Object.keys(matchGroup);
      const objectMarkets = bookMarkets.reduce((obj, bookMarketName) => {
        const data = mergeDataCopy.filter(
          (v) => v[bookMarketName]?.id === matchGroup[bookMarketName].id
        );
        let temporalObject = {};
        data.forEach((match) => {
          temporalObject = {
            ...temporalObject,
            ...match
          };
        });
  
        return { ...obj, ...temporalObject };
      }, {});
      return [...arr, objectMarkets];
    }, []);
  
    const finalData = filterData.reduce((arr, option) => {
      const isInArray = arr.findIndex((v) => _.isEqual(v, option)) !== -1;
      if (isInArray) return arr;
      return [...arr, option];
    }, []);
  
    return finalData;
  };






export default {
  findSameMatches,
  delay,
  getRoute,
  matchAllMatches
};
