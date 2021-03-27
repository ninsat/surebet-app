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
    console.log("No hay ningun partido que empice a  la misma hora del partido => ",match.eventName)
    return undefined;
  } 

  const sameDateMatcheNames = sameDateMatches.map(m => m.team1.toLocaleLowerCase())
  const {bestMatchIndex, bestMatch} =  stringSimilarity.findBestMatch(match.event.homeName.toLocaleLowerCase(), sameDateMatcheNames)
  
  let actualMatch = undefined
  if(bestMatch.rating >= 0.25){
    actualMatch = sameDateMatches[bestMatchIndex]
  }



  if (actualMatch === undefined) {
    const eventListNames = sameDateMatches.map(m => m.eventName.toLocaleLowerCase())
    const matchObject = stringSimilarity.findBestMatch(match.eventName.toLocaleLowerCase(), eventListNames)
    console.log(match.eventName, matchObject)
    return undefined;
  }

  const secontTeamEqual =
    stringSimilarity.compareTwoStrings(
      match.event.awayName.toLocaleLowerCase(),
      actualMatch.team2.toLocaleLowerCase()
    ) >= 0.2;

  if (!secontTeamEqual) {
    console.log("El segundo equipo no tiene coincidencia => ",match.eventName)
    return undefined;
  }

  return {
    betPlay: match,
    xBet: actualMatch
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
