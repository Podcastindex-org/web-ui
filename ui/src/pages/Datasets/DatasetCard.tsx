import * as React from 'react'

export interface Dataset {
    name: string
    url: string
    format: string
    cadence: string
    description: string
}

interface IProps {
    dataset: Dataset
}

const DatasetCard: React.FunctionComponent<IProps> = ({ dataset }) => {
    return (
        <div className="dataset-card">
            <h3 className="dataset-card-title">
                <a
                    href={dataset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {dataset.name}
                </a>
            </h3>
            <div className="dataset-card-badges">
                <span className="dataset-card-badge">{dataset.format}</span>
                <span className="dataset-card-badge">{dataset.cadence}</span>
            </div>
            <p className="dataset-card-description">{dataset.description}</p>
        </div>
    )
}

export default DatasetCard
