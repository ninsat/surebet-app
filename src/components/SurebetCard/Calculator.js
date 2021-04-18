import React, {useState} from 'react';
import { createUseStyles} from 'react-jss'
import clsx from 'clsx'

const useStyles = createUseStyles({
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
    }
})

const Calculator = props => {
    
    const classes = useStyles()

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
                        <span>18 Apr 07:30</span>
                    </div>
                </div>
                <div className={classes.eventInfo}>
                    <span className={classes.eventName}>Arsenal FC - FullHam</span>
                    <span className={classes.eventGroup}>Englan Premier League</span>
                </div>
            </div>
        </div>
    )
}


export default Calculator