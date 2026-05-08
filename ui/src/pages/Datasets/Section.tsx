import * as React from 'react'

import DatasetCard, { Dataset } from './DatasetCard'

export interface Section {
    id: string
    name: string
    description: string
    datasets: Dataset[]
}

interface IProps {
    section: Section
}

const SectionBlock: React.FunctionComponent<IProps> = ({ section }) => {
    return (
        <section id={section.id} className="datasets-section">
            <h2 className="datasets-section-title">{section.name}</h2>
            <p className="datasets-section-description">{section.description}</p>
            <div className="datasets-section-grid">
                {section.datasets.map((dataset) => (
                    <DatasetCard key={dataset.url} dataset={dataset} />
                ))}
            </div>
        </section>
    )
}

export default SectionBlock
