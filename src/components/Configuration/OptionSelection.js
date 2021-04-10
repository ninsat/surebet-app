import React from 'react';
import { createUseStyles } from "react-jss";
import clsx from "clsx"



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



const OptionSelection = ({options, title, onChangeOption}) => {

    const classes = useStyles()

    return(
        <div className="menu">
            <p className="menu-label">
                {title}
            </p>
            <ul className="menu-list">
                {
                    Object.keys(options).map(option => (
                        <li key={option}>
                            <label  className={clsx("checkbox", classes.label)}>
                                <a>      
                                    <input onChange={onChangeOption(option)} checked={options[option].active} className={classes.checkbox} type="checkbox"/>
                                    {options[option].name}
                                </a>
                            </label>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}



export default OptionSelection