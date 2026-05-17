import * as React from 'react'

import { Section } from './Section'

interface IProps {
    sections: Section[]
}

const TableOfContents: React.FunctionComponent<IProps> = ({ sections }) => {
    return (
        <nav className="datasets-toc" aria-label="Datasets sections">
            <ul className="datasets-toc-list">
                {sections.map((section) => (
                    <li key={section.id} className="datasets-toc-item">
                        <a
                            className="datasets-toc-link"
                            href={`#${section.id}`}
                        >
                            {section.name}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default TableOfContents
