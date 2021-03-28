import React from 'react';
import clsx from 'clsx'
import { createUseStyles } from "react-jss";

import numeral from "numeral"
import moment from "moment"


const useStyles = createUseStyles({
    card: {

    },
    headers: {
        display: "flex",
    },
    profit: {
        width: 70,
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        "& span": {
            fontWeight: 900,
            color: "#FFF"
        }
    },
    sport: {
        flex: 1,
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        "& span": {
            color: "#FFF",
            fontWeight: 900,
        }
    },
    time: {
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        "& span": {
            color: "#FFF",
        }
    },
    item: {
        display: "flex",
        background: "#eee"
    },
    company: {
        width: 70,
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
    },
    event: {
        flex: 4,
        padding: "5px 10px",
    },
    name: {
        font: {
            weight: 600,
            size: 14
        },
        display: "block",
    },
    date: {
        font: {
            weight: 300,
            size: 13
        },
    },
    market: {
        flex: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px 10px",
        fontSize: 13,
        textAlign: "center",
    },
    odds:{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px 10px",
        fontSize: 15,
        fontWeight: 700
    }
})

const SurebetCard = ({data}) => {

    const classes = useStyles()

    return (
        <div className={classes.card}>
            <div className={classes.headers}>
                <div className={clsx(classes.profit, "has-background-success")}>
                    <span>{numeral(data.profit/100).format("%0.00")}</span>
                </div>
                <div className={clsx(classes.sport, "has-background-info has-text-weight-medium")}>
                    <span>Futbol</span>
                </div>
                <div className={clsx(classes.time, "has-background-info")}>
                    <span className="icon-text">
                        <span className="icon">
                            <i className="far fa-clock"></i>
                        </span>
                        <span>2 min</span>
                    </span>
                </div>
            </div>
            <div className="content">
                {
                    data.options.map((option, index)=>(
                        <div key={index} className={clsx(classes.item)}>
                            <div className={clsx(classes.company, "has-text-link has-text-weight-medium")}>
                                {option.comapanyName}
                            </div>
                            <div className={clsx(classes.event)}>
                                <span className={clsx(classes.name)}>{option.eventName}</span>
                                <span className={clsx(classes.date)}>{moment(option.date_start).format("DD/MM/YYYY, h:mm a")}</span>
                            </div>
                            <div className={clsx(classes.market)}>
                                {option.market} - {option.oddsType} {option.type? `(${option.type})` : ""}
                            </div>
                            <div className={clsx(classes.odds, "has-text-info")}>
                                {option.odds}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}



export default SurebetCard