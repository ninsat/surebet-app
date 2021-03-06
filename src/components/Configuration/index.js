import React from 'react';
import { createUseStyles } from "react-jss";
import clsx from "clsx"


import ProgressBar from "../ProgressBar"
import OptionSelection from "./OptionSelection"
import FilterSelector from './FilterSelector'

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



const Configuration = ({loadData, bookMarkets, onChangeBookMarkets,onChangeSports, sports, ...props}) => {

    const classes = useStyles()

    return(
        <div className={clsx("box", classes.root)}>
            <ProgressBar data={loadData}/>
            <FilterSelector />
            <hr></hr>
            <OptionSelection
                onChangeOption={onChangeBookMarkets} 
                options={bookMarkets} 
                title="Casas De Apuestas"/>
            <hr/>
            <OptionSelection
                onChangeOption={onChangeSports} 
                options={sports} 
                title="Deportes"/>
            <hr/>
      

        </div>
    )
}



export default Configuration