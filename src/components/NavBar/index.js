import React from 'react';
import { createUseStyles } from "react-jss";
import clsx from "clsx"


const useStyles = createUseStyles({
    root:{
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
    },
    title:{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: 700,
        fontSize: 19
    },
    divider:{
        flex: 1,
 
    },
    actions:{

    }
})


const NavBar = (props)=>{
    const classes = useStyles()
    return (
        <nav className={clsx(classes.root, "box")}>
            <div className={classes.title}>
                FADADU BETS
            </div>
            <div className={classes.divider}>
            </div>
            <div className={classes.actions}>
                <button onClick={props.onClick} className="button is-primary">
                    Buscar Surebets
                </button>
            </div>
            
        </nav>
    )
}



export default NavBar