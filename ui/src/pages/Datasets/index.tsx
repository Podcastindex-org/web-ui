import * as React from 'react'
import { useEffect } from 'react'

import { updateTitle } from '../../utils'

import './styles.scss'

const Datasets: React.FunctionComponent = () => {
    useEffect(() => {
        updateTitle('Datasets')
    }, [])

    return (
        <div className="datasets-page">
            <p>Datasets page — content coming.</p>
        </div>
    )
}

export default Datasets
