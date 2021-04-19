import React, {useState, Fragment, useEffect} from 'react';
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

const SurbetGroup = ({surebets, ...props}) => {
    const [selectedGroup, setSelectedGroup] = useState([])
    const [principalSurbets, setPrincipalSurbets] = useState([])
    const [selectedSurebet, setSelectedSurebet] = useState(null)
    const classes = useStyles()


    useEffect(()=>{
        const copySurebets = surebets.slice()
        const groupData = surebets.reduce((result, surebet)=>{
            const isInArray = result.findIndex(v => v.groupId === surebet.groupId)
            if(isInArray !== -1) return result
            const groupSurebet = copySurebets.filter(v => v.groupId === surebet.groupId).sort((a,b)=> b.profit - a.profit)
            return [...result, groupSurebet[0]]
        },[])
        setPrincipalSurbets(groupData)
    },[surebets])



    const handleSelectGrouo = (group)=>()=>{
        setSelectedGroup(group)
    }


    const handleSelect = (surebet) => ()=>{
        setSelectedSurebet(surebet)
        const surebetGroup = surebets.filter(v => v.groupId === surebet.groupId).sort((a,b)=> b.profit - a.profit)
        setSelectedGroup(surebetGroup)
    }

    return(
        <div className={clsx(classes.root, "box")}>
            <div className={classes.mainPanel}>
                {
                   principalSurbets.map((surebet) => (
                    <SurebetCard
                        selected={selectedSurebet?._id === surebet._id} 
                        onSelect={handleSelect(surebet)} 
                        sports={props.sports} 
                        key={surebet.groupId} 
                        data={surebet} />
                    ))
                }
            </div>
            <div className={classes.detailsPanel}>
                {
                    selectedSurebet?
                    <Fragment>
                        <Calculator sports={props.sports} surebet={selectedSurebet}/>
                        <div className={classes.allSurebets}>
                            {
                                selectedGroup.map((surebet, index) => (
                                <SurebetCard
                                    selected={selectedSurebet._id === surebet._id} 
                                    onSelect={handleSelect(surebet)} 
                                    sports={props.sports} 
                                    key={surebet._id} 
                                    data={surebet} />
                                ))
                            }
                        </div>
                    </Fragment>
                    :
                    <Fragment>
                        <h1 className="m-5 has-text-centered title is-2">Seleccione una Surebet</h1>
                    </Fragment>
                }
            </div>
        </div>
    )
}


export default SurbetGroup