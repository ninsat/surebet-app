import utilities from "./utilities";
import stringSimilarity from "string-similarity";

const isSurebet = (c1, c2) => {
  if (c1 === 0 || c2 === 0) return false;
  if (isNaN(c1) || isNaN(c2)) return false;
  const p1 = 1 / c1;
  const p2 = 1 / c2;
  return p1 + p2 < 1;
};

const getProfit = (c1, c2) => {
  const p1 = (1 / c1)
  const p2 = (1 / c2)
  const totalP = p1 + p2

  return (100 / totalP) - 100
}

const compareFunction = (match, market, option1, option2) => {
  const resultSurebets = []
  const companies = Object.keys(match);
  companies.forEach((company) => {
    const marketList = match[company].markets[market];
    marketList.forEach((option) => {
      companies.forEach((companyActual) => {
        const options = match[companyActual].markets[market];
        const actualOdds = options.find((v) => v.type === option.type);
        if (actualOdds === undefined) return console.log("--- no surebet ---");
        const under = isSurebet(option[option1].v, actualOdds[option2].v);
        const over = isSurebet(option[option2].v, actualOdds[option1].v);
        if (under) {

          return console.log(
            "HAY UNA FUCKING SUREBET!!!!!!!!",
          );
        } else if (over) {
          return console.log(
            "HAY UNA FUCKING SUREBET!!!!!!!!",
          );

        } else {
          console.log("--- no surebet ---");
        }
      });
    });
  });
};

const compareFunctionObject = (match, market, option1, option2) => {
  const companies = Object.keys(match);
  companies.forEach((company) => {
    const option = match[company].markets[market];

    companies.forEach((companyActual) => {
      const actualOdds = match[companyActual].markets[market];
      if (actualOdds === undefined) return console.log("--- no surebet ---");
      const op1 = isSurebet(option[option1]?.v || 0, actualOdds[option2].v);
      const op2 = isSurebet(option[option2]?.v || 0, actualOdds[option1].v);
      if (op1 || op2) {
        return console.log(
          "HAY UNA FUCKING SUREBET!!!!!!!!",
          match.betPlay.event.name,
          market,
          match
        );
      } else {
        console.log("--- no surebet ---");
      }
    });
  });
};

const compareMatches = (matchGroup) => {
  const companies = Object.keys(matchGroup);
  companies.forEach((company) => {
    const companyMatchMarket = matchGroup[company].markets;
    Object.keys(companyMatchMarket).forEach((mathcMarket) => {
      const marketOptions = companyMatchMarket[mathcMarket];
      marketOptions.forEach((marketOption) => {
        companies.forEach((otherCompany) => {
          const otherCompanyMarket =
            matchGroup[otherCompany].markets[mathcMarket];
          if (!otherCompanyMarket) return console.log("-- no surebet --");
          const otherCompanyOption = otherCompanyMarket.find(
            (v) => v.type === marketOption.type
          );
          if (!otherCompanyOption) return console.log("-- no surebet --");
          const op1 = isSurebet(
            marketOption.over.v,
            otherCompanyOption.under.v
          );
          const op2 = isSurebet(
            marketOption.under.v,
            otherCompanyOption.over.v
          );
          if (op1 || op2) {
            console.log(
              "HAY SURBET",
              matchGroup.betPlay.event.name,
              mathcMarket
            );
            return;
          } else {
            console.log("-- no surebet --");
            return;
          }
        });
      });
    });
  });
};




const compareMatches2 = (matchGroup, markets = []) => {
  const result = [];
  const companies = Object.keys(matchGroup);
  companies.forEach((company) => {
    const companyMatchMarket = matchGroup[company].markets;
    Object.keys(companyMatchMarket).forEach((mathcMarket) => {
      //aqui tengo que revisar si el mercado es tipo OVER/UNDER ( este tiene un arreglo de opciones)
      //o si el mercado es tipo OBJECT (este solo tiene obciones dentro del onjeto)
      //un ejemplo de mercado tipo OBJECT es "todos marcan", ya que solo hay dos opciones
      // que son SI(YES) y No(NO) o el mercado de 1X2

      const marketObject = markets.find((v) => v.name === mathcMarket);

      if (marketObject.type === "OVER/UNDER") {
        //en caso de que sea typo OVER/UNDER se compara de la siguiente manera
        const marketOptions = companyMatchMarket[mathcMarket];
        marketOptions.forEach((marketOption) => {
          companies.forEach((otherCompany) => {
            const otherCompanyMarket =
              matchGroup[otherCompany].markets[mathcMarket];
            if (!otherCompanyMarket) return;
            const otherCompanyOption = otherCompanyMarket.find(
              (v) => v.type === marketOption.type
            );
            if (!otherCompanyOption) return;
            const op1 = isSurebet(
              marketOption.over.v,
              otherCompanyOption.under.v
            );
            const op2 = isSurebet(
              marketOption.under.v,
              otherCompanyOption.over.v
            );
            if (op1 && !marketObject[company.toLocaleLowerCase()]?.onlyUnder) {
              result.push({
                profit: getProfit(marketOption.over.v, otherCompanyOption.under.v),
                date: new Date(),
                options: [
                  {
                    comapanyName: company,
                    market: marketObject[company]?.market ? marketObject[company]?.market : marketObject.label,
                    odds: marketOption.over.v,
                    type: marketOption.type,
                    oddsType: "Más de",
                    eventName: matchGroup[company].eventName,
                    sport: matchGroup[company].sport,
                    date_start: matchGroup[company].date_start
                  },
                  {
                    comapanyName: otherCompany,
                    market: marketObject[otherCompany]?.market ? marketObject[otherCompany]?.market : marketObject.label,
                    odds: otherCompanyOption.under.v,
                    type: otherCompanyOption.type,
                    oddsType: "Menos de",
                    eventName: matchGroup[otherCompany].eventName,
                    sport: matchGroup[otherCompany].sport,
                    date_start: matchGroup[otherCompany].date_start
                  }
                ]
              })
              console.log(
                "HAY SURBET",
                matchGroup.betplay.event.name,
                mathcMarket
              );
            }

            if (op2 && !marketObject[company]?.onlyOver) {
              result.push({
                profit: getProfit(marketOption.under.v, otherCompanyOption.over.v),
                date: new Date(),
                options: [
                  {
                    comapanyName: company,
                    market: marketObject[company]?.market ? marketObject[company]?.market : marketObject.label,
                    odds: marketOption.under.v,
                    oddsType: "Menos de",
                    type: marketOption.type,
                    eventName: matchGroup[company].eventName,
                    date_start: matchGroup[company].date_start
                  },
                  {
                    comapanyName: otherCompany,
                    market: marketObject[otherCompany]?.market ? marketObject[otherCompany]?.market : marketObject.label,
                    odds: otherCompanyOption.over.v,
                    type: otherCompanyOption.type,
                    oddsType: "Más de",
                    eventName: matchGroup[otherCompany].eventName,
                    date_start: matchGroup[otherCompany].date_start
                  }
                ]
              })
              console.log(
                "HAY SURBET",
                matchGroup.betplay.event.name,
                mathcMarket
              );
            }
            //console.log("-- no surebet --");
            return;
          });
        });
      } else if (marketObject.type === "OBJECT") {
        //Si es de tipo Object se compara de la sicguiente manera
        const marketOptions = Object.keys(companyMatchMarket[mathcMarket]);
        marketOptions.forEach((marketOption) => {
          companies.forEach((otherCompany) => {
            //aqui ya se compara las cuetas de cada opcion(marketOption) con su opcion opuesta
            //con cada compañia(otherCompany)
            const odds1 = companyMatchMarket[mathcMarket][marketOption].v;
            const otherCompanyMarkets = matchGroup[otherCompany].markets;
            const odds2 = utilities.getRoute(
              otherCompanyMarkets,
              marketObject.options[marketOption].opposite.route
            ).v;
            const op = isSurebet(odds1, odds2);
            if (op) {
              result.push({
                profit: getProfit(odds1, odds2),
                date: new Date(),
                options: [
                  {
                    comapanyName: company,
                    market: marketObject.label,
                    odds: odds1,
                    oddsType: marketObject.options[marketOption].label,
                    type: null,
                    eventName: matchGroup[company].eventName,
                    date_start: matchGroup[company].date_start,
                    sport: matchGroup[company].sport,
                  },
                  {
                    comapanyName: otherCompany,
                    market: marketObject.options[marketOption].opposite.market,
                    odds: odds2,
                    type: null,
                    oddsType: marketObject.options[marketOption].opposite.label,
                    eventName: matchGroup[otherCompany].eventName,
                    sport: matchGroup[otherCompany].sport,
                    date_start: matchGroup[otherCompany].date_start
                  }
                ]
              })
              return console.log(
                "HAY SUREBET!",
                matchGroup,
                marketObject.label
              );
            }
          });
        });
      } else if (marketObject.type === "HANDICAP") {
        //aqui va la comparacion para los mercados tipo Handicap
        //se compara el handicap del home con el handicap del awayName
        const marketOptions = companyMatchMarket[mathcMarket];
        marketOptions.forEach(marketOption => {
          companies.forEach((otherCompany) => {
            const otherCompanyMarket = matchGroup[otherCompany].markets[mathcMarket];
            if (!otherCompanyMarket) return;
            const otherCompanyOption = otherCompanyMarket.find((v) => v.type === (marketOption.type * -1));
            if (!otherCompanyOption) return;
            const op1 = isSurebet(marketOption.home.v, otherCompanyOption.away.v);
            const op2 = isSurebet(marketOption.away.v, otherCompanyOption.home.v);
            if (op1) {
              result.push({
                profit: getProfit(marketOption.home.v, otherCompanyOption.away.v),
                date: new Date(),
                options: [
                  {
                    comapanyName: company,
                    market: marketObject[company]?.market ? marketObject[company]?.market : marketObject.label,
                    odds: marketOption.home.v,
                    type: marketOption.type,
                    oddsType: matchGroup[company].team1,
                    eventName: matchGroup[company].eventName,
                    sport: matchGroup[company].sport,
                    date_start: matchGroup[company].date_start
                  },
                  {
                    comapanyName: otherCompany,
                    market: marketObject[otherCompany]?.market ? marketObject[otherCompany]?.market : marketObject.label,
                    odds: otherCompanyOption.away.v,
                    type: otherCompanyOption.type,
                    oddsType: matchGroup[otherCompany].team2,
                    eventName: matchGroup[otherCompany].eventName,
                    sport: matchGroup[otherCompany].sport,
                    date_start: matchGroup[otherCompany].date_start
                  }
                ]
              })
            }
            if (op2) {
              result.push({
                profit: getProfit(marketOption.away.v, otherCompanyOption.home.v),
                date: new Date(),
                options: [
                  {
                    comapanyName: company,
                    market: marketObject[company]?.market ? marketObject[company]?.market : marketObject.label,
                    odds: marketOption.away.v,
                    type: marketOption.type,
                    oddsType: matchGroup[company].team2,
                    eventName: matchGroup[company].eventName,
                    sport: matchGroup[company].sport,
                    date_start: matchGroup[company].date_start
                  },
                  {
                    comapanyName: otherCompany,
                    market: marketObject[otherCompany]?.market ? marketObject[otherCompany]?.market : marketObject.label,
                    odds: otherCompanyOption.home.v,
                    type: otherCompanyOption.type,
                    oddsType: matchGroup[otherCompany].team1,
                    eventName: matchGroup[otherCompany].eventName,
                    sport: matchGroup[otherCompany].sport,
                    date_start: matchGroup[otherCompany].date_start
                  }
                ]
              })
            }

          })
        })
      } else if (marketObject.type === "OBJECT-PARTICIPANT") {
        const marketOptions = companyMatchMarket[mathcMarket];
        marketOptions.forEach((marketOption) => {
          companies.forEach((otherCompany) => {
            const otherCompanyMarket = matchGroup[otherCompany].markets[mathcMarket];
            if (!otherCompanyMarket) return;
            const otherCompanyParticipantNames = otherCompanyMarket.map(v=> v.participant)
            const {bestMatchIndex, bestMatch} = stringSimilarity.findBestMatch(marketOption.participant, otherCompanyParticipantNames)
            if(bestMatch.rating < 0.55) return
            const otherCompanyOption = otherCompanyMarket[bestMatchIndex]
            Object.keys(marketObject.options).forEach(option =>{
              const op = isSurebet(marketOption[option].v, otherCompanyOption[marketObject.options[option].opposite.route].v);
              if(op){
                result.push({
                  profit: getProfit(marketOption[option].v, otherCompanyOption[marketObject.options[option].opposite.route].v),
                  date: new Date(),
                  options: [
                    {
                      comapanyName: company,
                      market: marketObject[company]?.market ? marketObject[company]?.market : marketObject.label,
                      odds: marketOption[option].v,
                      type: marketObject.options[option].label,
                      oddsType: marketOption.participant,
                      eventName: matchGroup[company].eventName,
                      sport: matchGroup[company].sport,
                      date_start: matchGroup[company].date_start
                    },
                    {
                      comapanyName: otherCompany,
                      market: marketObject[otherCompany]?.market ? marketObject[otherCompany]?.market : marketObject.label,
                      odds: otherCompanyOption[marketObject.options[option].opposite.route].v,
                      type: marketObject.options[option].opposite.label,
                      oddsType: otherCompanyOption.participant,
                      eventName: matchGroup[otherCompany].eventName,
                      sport: matchGroup[otherCompany].sport,
                      date_start: matchGroup[otherCompany].date_start
                    }
                  ]
                })
              }
            })
          })
        })
      }
    });
  });

  if (result.length) {
    return result;
  }

  return null;

};

const compareOdds = (match) => {
  compareFunction(match, "totals", "under", "over");
  //compareFunctionObject(match, "bothToScore", "yes", "no");
};

export default {
  isSurebet,
  compareOdds,
  compareMatches,
  compareMatches2,
  getProfit
};
