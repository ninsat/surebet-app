import React from 'react';
import { createUseStyles } from "react-jss";
import clsx from "clsx"


const useStyles = createUseStyles({
    root:{
        height: "calc(100vh - 40px - 4.75rem)",
        padding: "0 !important",
        overflow: "auto"
    },
 
})



const SurbetContainer = (props) => {

    const classes = useStyles()

    return(
        <div className={clsx("box", classes.root)}>
            {props.children}
        </div>
    )
}



export default SurbetContainer