import React, {useState, Fragment} from 'react'
import clsx from 'clsx'
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
    dropDown:{
        width: "100%",
        "& *": {
            width: "100%"
        }
    }
})

const FilterSelector = props => {
    const classes = useStyles()
    const [options, setOptions] = useState([
        {
            label: "Sin orden específico",
            id: "none",
            active: true
        },
        {
            label: "Surebet con mas porcentaje",
            id: "profit",
            active: false
        },
        {
            label: "Fecha de inicio del envento",
            id: "date",
            active: false
        },
        {
            label: "Surebet mas nuevas (Proximamente)",
            id: "newSurebets",
            active: false
        }
    ])
    const [active, setActive] = useState(false)
    const handleChangeActive = ()=>{
        setActive(v=>!v)
    }
    const handleSelectOption = (option)=> () =>{
        setOptions(v=>{
            const copy = v.slice()
            const unActiveOptions = copy.map(op =>({...op, active: false}))
            const index = unActiveOptions.findIndex(op => op.id === option.id)
            if(index === -1) return v
            unActiveOptions[index].active = true
            return unActiveOptions
        })
        setActive(false)
    }
    return (
        <Fragment>
            <p className="menu-label">
                Ordenar por
            </p>
            <div className={clsx("dropdown", {["is-active"]:active}, classes.dropDown)}>
                <div className={clsx("dropdown-trigger", classes.dropDown)}>
                    <button onClick={handleChangeActive} className="button" aria-haspopup="true" aria-controls="dropdown-menu">
                        <span>{options.find(v=> v.active)?.label || "Ningun filtro seleccionado"}</span>
                        <span className="icon is-small">
                            <i className="fas fa-angle-down" aria-hidden="true" />
                        </span>
                    </button>
                </div>
                <div className={clsx("dropdown-menu", classes.dropDown)} id="dropdown-menu" role="menu">
                    <div className="dropdown-content">
                        {
                            options.map(option =>(
                                <a onClick={handleSelectOption(option)} key={option.id} href="#" className={clsx("dropdown-item",{["is-active"]: option.active})}>
                                    {option.label}
                                </a>
                            ))
                        }
                    </div>
                </div>
            </div>
        </Fragment>

    )
}


export default FilterSelector