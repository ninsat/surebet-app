import stringSimilarity from "string-similarity";

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

const findSameMatches = (betPlayArray, XbetArray) => {
  const result = [];
  betPlayArray.forEach((match) => {
    const data = matchTheMatch(match, XbetArray);
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

export default {
  findSameMatches,
  delay,
  getRoute
};
