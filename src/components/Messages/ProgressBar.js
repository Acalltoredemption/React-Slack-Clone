import React from 'react';
import {Progress} from 'semantic-ui-react'

const ProgressBar = ({uploadState, percentUploaded}) => {
    return(
    uploadState === 'uploading' && (
        <Progress
        className="progress__bar"
        progress
        percent={percentUploaded}
        indicating
        size="medium"
        inverted
         />
    )
    )
}

export default ProgressBar;