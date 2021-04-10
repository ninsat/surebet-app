import React from 'react';
import { createUseStyles } from "react-jss";
import clsx from "clsx"


import ProgressBar from "../ProgressBar"
import OptionSelection from "./OptionSelection"

const useStyles = createUseStyles({
    root:{
        height: "calc(100vh - 40px - 4.75rem)",
        overflow: "auto",
    },
    checkbox:{
        marginRight: 5
    }, 
    label:{
        display: "block"
    }
 
})



const Configuration = ({loadData, bookMarkets, onChangeBookMarkets,...props}) => {

    const classes = useStyles()

    return(
        <div className={clsx("box", classes.root)}>
            <ProgressBar data={loadData}/>
            <OptionSelection
                onChangeOption={onChangeBookMarkets} 
                options={bookMarkets} 
                title="Casas De Apuestas"/>
            
            <div className="content">
                <blockquote>No Se emocionen todavia, los deportes no estan funcionando, solo busca surebets en futbol ;) </blockquote>
            </div>


        </div>
    )
}



export default Configuration