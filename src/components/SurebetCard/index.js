import React, {useState, Fragment} from 'react';
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
        width: 80,
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        "& span": {
            fontWeight: 900,
            color: "#FFF",
            fontsize: 15
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
            fontsize: 15
        }
    },
    inversion:{
        width:150,
        display: "flex",
        alignItems: "center",
        padding: "2px 0px",
    },
    profitValue:{
        display: "flex",
        alignItems: "center",
        margin: {
            right: 10
        }
    },
    time: {
        padding: "5px 10px",
        display: "flex",
        fontSize: 13,
        alignItems: "center",
        "& span": {
            color: "#FFF",
        }
    },
    item: {
        display: "flex",
        background: "#f4f3f3",
        "&:nth-child(2n)":{
            background: "#fff",
        }
    },
    company: {
        width: 80,
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        color: "#3974a7",
        fontSize: 15
    },
    event: {
        flex: 4,
        padding: "5px 10px",
    },
    name: {
        font: {
            weight: 600,
            size: 13
        },
        color: "#222222",
        display: "block",
    },
    date: {
        font: {
            weight: 300,
            size: 13
        },
        color: "#45515f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0px 12px"
    },
    market: {
        flex: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px 10px",
        fontSize: 13,
        textAlign: "center",
        color: "#3974a7"
    },
    odds:{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px 10px",
        fontSize: 15,
        fontWeight: 700,
        color: "#1c476c"
    },
    value:{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px 10px"
    },
    group:{
        fontSize: 12,
        color: "#45515f"
    }
})

const SurebetCard = ({data, sports}) => {

    const classes = useStyles()
    const [calculator, setCalculator] = useState(false)
    const [inversion, setInversion] = useState("0")
    const [value, setValue] = useState(Array(data.options.length).fill(0))

    const handleChangeCalculator = ()=>{
        setCalculator(v=> !v)
    }
    const handleChangeInversion = (e)=>{
        const inputValue = numeral(e.target.value).format("0,0")
        const totalInversion = numeral(e.target.value).value()
        const percentList = data.options.map(v => (1/v.odds)*100)
        const totalPercent = percentList.reduce((total, p)=> total + p, 0)
        const valueList = percentList.map( p => (totalInversion*p)/totalPercent)
        if(totalPercent){
            setValue(valueList)
        }else{
            setValue(v => v.map(_ => 0))
        }
        setInversion(inputValue)
    }

    return (
        <div className={classes.card}>
            <div className={clsx(classes.headers, "has-background-info")}>
                <div className={clsx(classes.profit, "has-background-success")}>
                    <span>{numeral(data.profit/100).format("%0.00")}</span>
                </div>
                <div className={clsx(classes.sport, `has-background-info has-text-weight-medium`)}>
                    <span>{sports[data.sport].name}</span>
                </div>

                {
                    calculator?
                    <Fragment>
                        <div className={classes.profitValue}>
                            <span className="title is-5 has-text-white">( {numeral(numeral(inversion).value() * (data.profit/100)).format("$0,0")} )</span>
                        </div>
                        <div className={clsx(classes.inversion)}>
                            <div className={clsx("field")}>
                                <p className="control has-icons-left has-icons-right">
                                    <input onChange={handleChangeInversion} value={inversion} className="input" type="text" placeholder="Inversion"/>
                                    <span className="icon is-small is-left">
                                        <i className="fas fa-dollar-sign"/>
                                    </span>
                                </p>
                            </div>
                        </div>
                    </Fragment>
                    :
                    <div className={clsx(classes.time, "has-background-info")}>
                        <span className="icon-text">
                            <span className="icon">
                                <i className="far fa-clock"></i>
                            </span>
                            <span>2 min</span>
                        </span>
                    </div>
                }
                <div>
                <button onClick={handleChangeCalculator} className="button is-ghost has-text-white">
                    <span className="icon is-small">
                        <i className="fas fa-calculator"></i>
                    </span>
                </button>
                </div>
            </div>
            <div className="content">
                {
                    data.options.map((option, index)=>(
                        <div key={index} className={clsx(classes.item)}>
                            <div className={clsx(classes.company, "has-text-weight-medium")}>
                                {option.comapanyName}
                            </div>
                            <div className={classes.date}>
                                {moment(option.date_start).format("DD MMM")}<br/>{moment(option.date_start).format("kk:mm")}
                            </div>
                            <div className={clsx(classes.event)}>
                                <a target="_blank" href={option.url}>
                                    <span className={clsx(classes.name)}>{option.eventName}</span>
                                </a>
                                <span className={clsx(classes.group)}>{option.group}</span>
                            </div>
                            <div className={clsx(classes.market)}>
                                {option.market} - {option.oddsType} {option.type !== null? `(${option.type})` : ""}
                            </div>
                            <div className={clsx(classes.odds)}>
                                {option.odds}
                            </div>
                            {
                                calculator && 
                                <div className={classes.value}>
                                    <span className="subtitle is-6">{numeral(value[index]).format("$0,0")}</span>
                                </div>
                            }
                        </div>
                    ))
                }
            </div>
        </div>
    )
}



export default SurebetCard