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
  const actualMatch = sameDateMatches.find(
    (e) =>
      stringSimilarity.compareTwoStrings(
        match.event.homeName.toLocaleLowerCase(),
        e.team1.toLocaleLowerCase()
      ) >= 0.3
  );

  if (actualMatch === undefined) return undefined;

  const secontTeamEqual =
    stringSimilarity.compareTwoStrings(
      match.event.awayName.toLocaleLowerCase(),
      actualMatch.team2.toLocaleLowerCase()
    ) >= 0.3;

  if (!secontTeamEqual) return undefined;

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
