import React,{Fragment} from 'react';
import clsx from 'clsx';


const ProgressBar = ({data, container}) =>{
    return (
        <Fragment>
            {
                data.loading &&
                <div className={clsx({box: container})}>
                    <p className="is-size-6 has-text-centered">{data.count} / {data.total}</p>
                    <progress className="progress" value={String(data.progress)} max="100">{data.progress}%</progress>
                    <p className="subtitle is-6 has-text-centered">{data.message} {data.extra}</p>
                    {
                        !container && <hr/>
                    }
                </div>
            }
        </Fragment>
    )
}



export default ProgressBar