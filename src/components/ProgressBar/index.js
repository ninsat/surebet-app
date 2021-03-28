import React,{Fragment} from 'react';



const ProgressBar = ({data}) =>{
    return (
        <Fragment>
            {
                data.loading &&
                <div className="box">
                    <progress className="progress" value={String(data.progress)} max="100">{data.progress}%</progress>
                    <p className="is-size-6 has-text-centered">{data.message} / {data.extra}</p>
                </div>
            }
        </Fragment>
    )
}



export default ProgressBar