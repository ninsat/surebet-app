import React, {useState, Fragment} from 'react';
import { createUseStyles} from 'react-jss'
import SurebetCard from './'
import Calculator from './Calculator'
import clsx from 'clsx'

const useStyles = createUseStyles({
    root:{
        display: "flex",
        height: "calc(100vh - 40px - 4.75rem)",
        padding: "0 !important",
        overflow: "hidden"
    },
    mainPanel:{
        flex: 1,
        overflow: "auto"
    },
    detailsPanel:{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        borderLeft: "4px solid #1c476c"
    },
    calculator:{
        
    },
    allSurebets:{
        overflow: "auto",
    }
})

const SurbetGroup = props => {
    const [selectedGroup, setSelectedGroup] = useState([])
    const classes = useStyles()

    const handleSelectGrouo = (group)=>()=>{
        setSelectedGroup(group)
    }

    return(
        <div className={clsx(classes.root, "box")}>
            <div className={classes.mainPanel}>
                {
                    props.surebets.map((surebet, index) => (
                    <SurebetCard onSelect={handleSelectGrouo(surebet)} sports={props.sports} key={surebet[0].groupId} data={surebet[0]} />
                    ))
                }
            </div>
            <div className={classes.detailsPanel}>
                {
                    selectedGroup.length?
                    <Fragment>
                        <Calculator surebet={selectedGroup[0]}/>
                        <div className={classes.allSurebets}>
                            {
                                selectedGroup.map((surebet, index) => (
                                <SurebetCard sports={props.sports} key={index} data={surebet} />
                                ))
                            }
                        </div>
                    </Fragment>
                    :
                    <Fragment>
                        Seleccione una Surebet
                    </Fragment>
                }
            </div>
        </div>
    )
}


export default SurbetGroup