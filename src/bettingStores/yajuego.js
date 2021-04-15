const getSpecialData = async () => {
    const url = encodeURIComponent(
        `https://sports.yajuego.co/desktop/feapi/PalimpsestAjax/GetPlayers?SID=2000001&v_cache_version=1.156.4.921`
    );
    const response = await fetch(`https://api.allorigins.win/get?url=${url}`);

    if (!response.ok) throw new Error("Network response was not ok.");

    const data = await response.json();

    const matchData = JSON.parse(data.contents).D
    const specialOptions = matchData.PLY

    const matchIds = specialOptions.reduce((arr, option)=>{
        const temp = Object.keys(option.SG)
                            .map(v=> option.SG[v].G)
                            .map(v => Object.keys(v)
                            .map(j=> v[j]))
                            .reduce((arr, op)=> [...arr, ...op], [])
                            .map(data => Object.keys(data.E).map(v=> ({EVENT_NAME: data.E[v].G_DESC, id: v})))
                            .reduce((arr, op)=> [...arr, ...op], [])
        console.log(option)
        const indexs = temp.map(v => arr.findIndex(op => op.id === v.id))
        const copyArray = arr.slice()
        const isNoInArray = []
        indexs.forEach((index, tempIdx) => {
            if(index === -1){
                isNoInArray.push(temp[tempIdx])
            }
            copyArray[index] = {
                ...copyArray[index],
                [option.CAT]: true
            }
        })

        isNoInArray.forEach(data =>{
            copyArray.push({
                ...data,
                [option.CAT]: true
            })
        })

        return copyArray
    }, [])
    return matchIds
}

const getSpecialMatch = async (id) => {
    //Group matkets 173 => cards || 32 => Score
    const url = encodeURIComponent(
        `https://sports.yajuego.co/desktop/feapi/PalimpsestAjax/GetEventsInGroupV2?GROUPID=${id}&GROUPMARKETID=32&DISP=0&v_cache_version=1.156.4.921`
    );
    const response = await fetch(`https://api.allorigins.win/get?url=${url}`);

    if (!response.ok) throw new Error("Network response was not ok.");

    const data = await response.json();

    const groupData = JSON.parse(data.contents).D
    
    const result = groupData.E.map(group => ({...group, MK: groupData.MK, TRANS: groupData.TRANS}))
    
    return result.map(match => formatSpecialMatches(match))

}

const formatSpecialMatches = (matchData) => {
    if(!matchData.MK) return {...matchData, originalMarket:{}}

    const newMarket = matchData.MK.map(v=>({
        ...v,
        MARKETID: v.ID,
        DS: v.NAME,
    }))

    const formatData = {
        ...matchData,
        MK:newMarket
    } 

    const originalMarket = formatData.MK.reduce((obj, { MARKETID, DS, ID }) => {
        return {
            ...obj,
            [MARKETID]: {
                id: MARKETID,
                name: DS,
                nameEs: matchData.TRANS[`M#${ID}`].NAME,
                options: formatMarketData(MARKETID, formatData)
            }

        }
    }, {})
    return {
        ...matchData,
        originalMarket
    }
}




//----------------------------------------------------------------------------------------------



const getMatchData = async (id) => {
    const url = encodeURIComponent(
        `https://sports.yajuego.co/desktop/feapi/PalimpsestAjax/GetEvent?EVENTID=${id}&v_cache_version=1.156.4.915`
    );
    const response = await fetch(`https://api.allorigins.win/get?url=${url}`);

    if (!response.ok) throw new Error("Network response was not ok.");

    const data = await response.json();

    const matchData = JSON.parse(data.contents).D;

    if(!matchData.MK) return {...matchData, originalMarket:{}}

    
    const originalMarket = matchData.MK.reduce((obj, { MARKETID, DS, ID }) => {
        return {
            ...obj,
            [MARKETID]: {
                id: MARKETID,
                name: DS,
                nameEs: matchData.TRANS[`M#${ID}`].NAME,
                options: formatMarketData(MARKETID, matchData)
            }

        }
    }, {})
    return {
        ...matchData,
        originalMarket
    }

}

const getBetOfferceYajuego = async (match, markets = []) => {
    const matchData = await getMatchData(match.id)
    return {
        ...matchData,
        markets: formatBetOffer(matchData, markets)
    }
}

const formatMarketData = (maketId, match) => {
    const handicapsMarketsIds = ["T_HND"]
    const markets = match.MK;
    const marketObject = markets.find((v) => v.MARKETID === maketId);

    if (!marketObject) return {};

    const options = marketObject.SGNK.reduce((arr, option) => {
        const expresionRegular = new RegExp(
            `${marketObject.ID}(@-?[0-9]+)?(\\.[0-9]+)?_${option}$`,
            "g"
        );
        const odds = Object.keys(match.O).filter((v) => expresionRegular.test(v));
        return [...arr, ...odds];
    }, []);

    //reviso si es tipo over/under o handicap
    const typeOverUder = options.reduce((type, option) => {
        return type && /@-?[0-9]+(\.[0-9]+)?/g.test(option);
    }, true);
    const typeHandicap = options.reduce((type, option) => {
        return type && /@-?[0-9]+(\.[0-9]+)?.*H$/g.test(option);
    }, true);

    const typeHandicapExeptions = handicapsMarketsIds.reduce((result, option)=> result || (option === marketObject.ID), false)

    if (typeHandicap || typeHandicapExeptions) {
        const formatOptions = options.map((v) => {
            const [type, variant] = v.replace(marketObject.ID + "@", "").split("_");
            let formatType = parseFloat(type);
            if (variant !== marketObject.SGNK[0]) formatType = formatType * -1;
            return {
                type: formatType,
                variant,
                ID: v,
                odds: parseFloat(match.O[v])
            };
        });



        const formatMarket = formatOptions.reduce((arrMarket, option) => {
            const isInTheArray =
                arrMarket.findIndex((v) => v.type === option.type) !== -1;

            if (isInTheArray) return arrMarket;

            const mergeObject = marketObject.SGNK.reduce(
                (obj, variant, index) => {
                    let odds = formatOptions
                        .filter((v) => v.type === option.type)
                        .find((v) => v.variant === variant)?.odds;
                    if (variant === option.variant) odds = option.odds;
                    return {
                        ...obj,
                        [marketObject.SGN[index]]: {
                            v: odds
                        }
                    };
                },
                { type: parseFloat(option.type) }
            );

            return [...arrMarket, mergeObject];
        }, []);

        return formatMarket;
    } else if (typeOverUder) {
        const formatOptions = options.map((v) => {
            const [type, variant] = v.replace(marketObject.ID + "@", "").split("_");
            return {
                type: parseFloat(type),
                variant,
                ID: v,
                odds: parseFloat(match.O[v])
            };
        });

        const formatMarket = formatOptions.reduce((arrMarket, option) => {
            const isInTheArray =
                arrMarket.findIndex((v) => v.type === option.type) !== -1;
            if (isInTheArray) return arrMarket;
            const sameTypeOptions = formatOptions.filter(
                (v) => v.type === option.type
            );

            const mergeObject = marketObject.SGNK.reduce(
                (obj, variant, index) => {
                    return {
                        ...obj,
                        [marketObject.SGN[index]]: {
                            v: sameTypeOptions.find((v) => v.variant === variant)?.odds
                        }
                    };
                },
                { type: parseFloat(option.type) }
            );

            return [...arrMarket, mergeObject];
        }, []);

        return formatMarket;
    } else {
        //Es un tipo OPTION
        const formatOptions = options.map((v) => {
            const variant = v.replace(marketObject.ID + "_", "");

            return {
                variant,
                ID: v,
                odds: parseFloat(match.O[v])
            };
        });

        const formatMarket = marketObject.SGNK.reduce((obj, option, index) => {
            return {
                ...obj,
                [marketObject.SGN[index]]: {
                    v: formatOptions.find((v) => v.variant === option)?.odds
                }
            };
        }, {});

        return formatMarket;
    }
};


const getGroupsIds = async (sport) => {
    const url = encodeURIComponent(
        `https://sports.yajuego.co/desktop/feapi/PalimpsestAjax/GetSports?DISP=0&v_cache_version=1.156.4.915`
    );
    const response = await fetch(`https://api.allorigins.win/get?url=${url}`);

    if (!response.ok) throw new Error("Network response was not ok.");

    const data = await response.json();

    const allSports = JSON.parse(data.contents).D.PAL;
    
    const soccerId = Object.keys(allSports).find(v => allSports[v].S_DESC === sport)
    const soccer = allSports[soccerId].SG
    
    const allleagues = Object.keys(soccer).map(key => soccer[key]).reduce((arr, country) => {
        return [...arr, ...Object.keys(country.G)]
    }, [])
    return allleagues
};


const getLeagueMatches = async (leagueId) => {
    const url = encodeURIComponent(
        `https://sports.yajuego.co/desktop/feapi/PalimpsestAjax/GetEventsInGroupV2?GROUPID=${leagueId}&DISP=0&GROUPMARKETID=1&v_cache_version=1.156.4.915`
    );
    const response = await fetch(`https://api.allorigins.win/get?url=${url}`);

    if (!response.ok) throw new Error("Network response was not ok.");

    const data = await response.json();
    return JSON.parse(data.contents).D.E
}
const getBasketballLeagueMatches = async (leagueId) => {
    const url = encodeURIComponent(
        `https://sports.yajuego.co/desktop/feapi/PalimpsestAjax/GetEventsInGroupV2?GROUPID=${leagueId}&DISP=0&GROUPMARKETID=12&v_cache_version=1.156.4.915`
    );
    const response = await fetch(`https://api.allorigins.win/get?url=${url}`);

    if (!response.ok) throw new Error("Network response was not ok.");

    const data = await response.json();
    return JSON.parse(data.contents).D.E
}
const getTennisLeagueMatches = async (leagueId) => {
    const url = encodeURIComponent(
        `https://sports.yajuego.co/desktop/feapi/PalimpsestAjax/GetEventsInGroupV2?GROUPID=${leagueId}&DISP=0&GROUPMARKETID=61&v_cache_version=1.156.4.915`
    );
    const response = await fetch(`https://api.allorigins.win/get?url=${url}`);

    if (!response.ok) throw new Error("Network response was not ok.");

    const data = await response.json();
    return JSON.parse(data.contents).D.E
}


const getAllEvents = async () => {
    const ids = await getGroupsIds("Soccer")
    const result = [];
    for (id of ids) {
        const data = await getLeagueMatches(id)
        result.push(data)
        console.log("YA!!")
    }
    return result.reduce((arr, v) => [...arr, ...v], []).map(match => {
        const [team1, team2] = match.DS.split("||v||").map(v => v.replace("|", ""))
        return {
            ...match,
            id: match.ID,
            team1,
            team1En: team1,
            team2,
            team2En: team2,
            eventName: `${team1} - ${team2}`,
            date_start: new Date(match.STARTDATE).getTime(),
            sport: "FUTBOLL",
            group: match.GN,
            url: `https://sports.yajuego.co/event/${match.ID}`
        }
    })
}

const getAllBasketballEvents = async () => {
    const ids = await getGroupsIds("Basketball")
    const result = [];
    for (id of ids) {
        const data = await getBasketballLeagueMatches(id)
        result.push(data)
        console.log("YA!!")
    }
    return result.reduce((arr, v) => [...arr, ...v], []).map(match => {
        const [team1, team2] = match.DS.split("||v||").map(v => v.replace("|", ""))
        return {
            ...match,
            id: match.ID,
            team1,
            team1En: team1,
            team2,
            team2En: team2,
            eventName: `${team1} - ${team2}`,
            date_start: new Date(match.STARTDATE).getTime(),
            sport: "FUTBOLL",
            group: match.GN,
            url: `https://sports.yajuego.co/event/${match.ID}`
        }
    })
}


const getAllTennisEvents = async () => {
    const ids = await getGroupsIds("Tennis")
    const result = [];
    for (id of ids) {
        const data = await getTennisLeagueMatches(id)
        result.push(data)
        console.log("YA!!")
    }
    return result.reduce((arr, v) => [...arr, ...v], []).map(match => {
        const [team1, team2] = match.DS.split("||v||").map(v => v.replace("|", ""))
        return {
            ...match,
            id: match.ID,
            team1,
            team1En: team1,
            team2,
            team2En: team2,
            eventName: `${team1} - ${team2}`,
            date_start: new Date(match.STARTDATE).getTime(),
            sport: "FUTBOLL",
            group: match.GN,
            url: `https://sports.yajuego.co/event/${match.ID}`
        }
    })
}




const formatBetOffer = (match, markets) => {
    return markets.reduce((obj, market) => {

        const betOffer = match.originalMarket[market.yajuego?.id]
        if (!betOffer) return obj;

        if (market.type === "OVER/UNDER") {
            const formatOffers = betOffer.options.map((betofer) => {
                return {
                    type: betofer.type,
                    over: {
                        v: betofer.Over.v
                    },
                    under: {
                        v: betofer.Under.v
                    }
                };
            });

            return {
                ...obj,
                [market.name]: formatOffers
            };
        } else if (market.type === "OBJECT") {
            const options = Object.keys(market.options);
            const formatOffers = options.reduce((merketObj, option) => {
                return {
                    ...merketObj,
                    [option]: {
                        v: betOffer.options[market.options[option].yajuego.name].v
                    }
                };
            }, {});
            return {
                ...obj,
                [market.name]: formatOffers
            };
        } else if (market.type === "HANDICAP") {
            const formatOffers = betOffer.options.map((betofer) => {
                return {
                    type: betofer.type,
                    home: {
                        v: betofer["1"]?.v
                    },
                    away: {
                        v: betofer["2"]?.v
                    }
                };
            });

            return {
                ...obj,
                [market.name]: formatOffers
            };
        }

        return obj;
    }, {})
}



const formatAllBetOfers = (matches=[], markets)=>{
    return matches.map(match=>{
        return{
            ...match,
            markets: formatBetOffer(match, markets)
        }
    })
}

const getMatch = async (match, markets) => {
    const matchData = await getMatchData(match.id)
    const formatMarket = formatBetOffer(matchData, markets)
    return {
        ...match,
        markets: formatMarket
    }
}


export default {
    getAllEvents,
    getMatchData,
    formatBetOffer,
    formatAllBetOfers,
    getBetOfferceYajuego,
    getMatch,
    getAllBasketballEvents,
    getAllTennisEvents,
    getSpecialData,
    getSpecialMatch
}