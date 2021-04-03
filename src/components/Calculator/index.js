import React, {useState,} from 'react';
import { createUseStyles } from "react-jss";
import clsx from "clsx"
import numeral from 'numeral'

const useStyles = createUseStyles({
    inversionContainer:{

    },
    inversion: {
        width: 300,
    },
    infoContainer:{

    }
})


const Calculator = (props)=>{
    const classes = useStyles()
    const [inversion, setInversion] = useState("")

    const handleChangeInversion = (e)=>{
        const value = numeral(e.target.value).format("0,0")
        setInversion(value)
    }

    return (
        <div>
            <div className={classes.inversionContainer}>
                <div className={clsx(classes.inversion, "field")}>
                    <p className="control has-icons-left has-icons-right">
                        <input onChange={handleChangeInversion} value={inversion} className="input" type="text" placeholder="Inversion"/>
                        <span className="icon is-small is-left">
                            <i className="fas fa-dollar-sign"/>
                        </span>
                    </p>
                </div>
            </div>
            <div className={classes.infoContainer}>
                
            </div>
        </div>
    )
}



export default Calculator