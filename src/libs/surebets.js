import utilities from "./utilities";

const isSurebet = (c1, c2) => {
  if (c1 === 0 || c2 === 0) return false;
  if (isNaN(c1) || isNaN(c2)) return false;
  const p1 = 1 / c1;
  const p2 = 1 / c2;
  return p1 + p2 < 1;
};

const compareFunction = (match, market, option1, option2) => {
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
        if (under || over) {
          return console.log(
            "HAY UNA FUCKING SUREBET!!!!!!!!",
            match.betPlay.event.name,
            option.type,
            match
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
              return console.log(
                "HAY SUREBET!",
                matchGroup,
                marketObject.label
              );
            } else {
              console.log("-- no surebet --");
            }
          });
        });
      }
    });
  });
};

const compareOdds = (match) => {
  compareFunction(match, "totals", "under", "over");
  //compareFunctionObject(match, "bothToScore", "yes", "no");
};

export default {
  isSurebet,
  compareOdds,
  compareMatches,
  compareMatches2
};
