import React, {useState} from 'react';
import { createUseStyles} from 'react-jss'
import clsx from 'clsx'
import moment from 'moment'
import numeral from 'numeral'

const useStyles = createUseStyles({
    calculator:{
        borderBottom: "4px solid #1c476c",
        paddingBottom: 10
    },
    calculatorHeader:{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 53,
        boxShadow: "3'x 3px 10px #888"
    },
    profitInfo:{
        display: "flex",
        flexDirection: "column"
    },
    main:{
        display: "flex",
        flex: 1
    },
    profit:{
        flex: 1,
        width: 75,
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        "& span": {
            fontWeight: 700,
            color: "#FFF",
            fontsize: 15
        }
    },
    date:{
        flex: 1,
        fontSize: 13,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    eventInfo:{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        padding: 5,
        background: "#d3d3d3",
        height: "100%",
        padding: "0 10px",
        justifyContent: "center",
    },
    eventName:{
        fontSize: 15,
        fontWeight: 600,
    },
    eventGroup:{
        color: "#45515f",
        fontSize: 12
    },
    titles:{
        display: "flex",
        padding: "3px 0",
        background: "#ededed",
        "& > *":{
            flex: 1,
            textAlign: "center",
            fontSize: 11,
            fontWeight: 500
        }
    },
    item:{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "& > *":{
            flex: 1,
            textAlign: "center",
            fontSize: 13,
            padding: "2px 0px",
        },
        "&:nth-child(2n)":{
            background: "#f4f3f3",
        }
    },
    bookMarket: {
        color: "#3974a7",
        fontWeight: 500,
    },
    market:{
        color: "#3974a7",
        fontSize: 12
    },
    odds:{
        color: "#1c476c",
        fontWeight: 700
    },
    footer:{
        display: "flex",
    },
    spacer:{
        flex: 3,
        display: "flex",
        fontSize: 14,
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0px 15px"
    },
    inversion:{
        flex: 1,
        padding: "5px 0px",
    },
    spacer1:{
        flex: 1
    }
})

const Calculator = ({surebet}) => {
    const [inversion, setInversion] = useState("0")
    const [value, setValue] = useState(Array(surebet.options.length).fill(0))
    const classes = useStyles()


    const handleChangeInversion = (e)=>{
        const inputValue = numeral(e.target.value).format("0,0")
        const totalInversion = numeral(e.target.value).value()
        const percentList = surebet.options.map(v => (1/v.odds)*100)
        const totalPercent = percentList.reduce((total, p)=> total + p, 0)
        const valueList = percentList.map( p => (totalInversion*p)/totalPercent)
        if(totalPercent){
            setValue(valueList)
        }else{
            setValue(v => v.map(_ => 0))
        }
        setInversion(inputValue)
    }

    return( 
        <div className={classes.calculator}>
            <div className={classes.calculatorHeader}>
                <div className={classes.profitInfo}>
                    <div className={classes.main}>
                        <div className={clsx(classes.profit, "has-background-success")}>
                            <span>15.8%</span>
                        </div>
                        <div className={clsx(classes.profit, "has-background-info")}>
                            <span>Futbol</span>
                        </div>
                    </div>
                    <div className={clsx(classes.date, "has-background-info-light")}>
                        <span>{moment(surebet.options[0].date_start).format("DD MMM kk:mm")}</span>
                    </div>
                </div>
                <div className={classes.eventInfo}>
                    <span className={classes.eventName}>{surebet.options[0].eventName}</span>
                    <span className={classes.eventGroup}>{surebet.options[0].group}</span>
                </div>
            </div>
            <div className={classes.calculatorContent}>
                <div className={classes.titles}>
                    <div>casa de apuestas</div>
                    <div>Mercado</div>
                    <div>Cuota</div>
                    <div>valor</div>
                    <div>Ganancia</div>
                </div>
                <div>
                {
                    surebet.options.map((option, index)=>(
                        <div key={index} className={clsx(classes.item)}>
                            <div className={classes.bookMarket}>
                                {option.comapanyName}
                            </div> 
                            <div className={classes.market}>
                                {option.market} - {option.oddsType} {option.type !== null? `(${option.type})` : ""}
                            </div>
                            <div className={classes.odds}>
                                {option.odds}
                            </div>
                            <div>
                                {numeral(value[index]).format("$0,0")}
                            </div>
                            <div>
                                %30.000
                            </div>
                        </div>
                    ))
                }
                <div className={classes.footer}>
                    <div className={classes.spacer}>
                        Inversión Total:
                    </div>
                    <div className={classes.inversion}>
                        <div className={clsx("field")}>
                            <p className="control has-icons-left has-icons-right">
                                <input onChange={handleChangeInversion} value={inversion} className="input is-small has-text-centered	" type="text" placeholder="Inversion"/>
                                <span className="icon is-small is-left">
                                    <i className="fas fa-dollar-sign"/>
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className={classes.spacer1}/>
                </div>

                </div>

            </div>
        </div>
    )
}


export default Calculator