import * as React from 'react'
import { useEffect, useState } from 'react'

import { updateTitle } from '../../utils'
import SectionBlock, { Section } from './Section'
import TableOfContents from './TableOfContents'

import './styles.scss'

interface DatasetsDoc {
    title: string
    tagline: string
    intro: string
    sections: Section[]
}

const Datasets: React.FunctionComponent = () => {
    const [data, setData] = useState<DatasetsDoc | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        updateTitle('Datasets')
        let cancelled = false

        const load = async () => {
            try {
                const response = await fetch('/api/datasets', {
                    credentials: 'same-origin',
                    method: 'GET',
                })
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }
                const json: DatasetsDoc = await response.json()
                if (!cancelled) {
                    setData(json)
                    setLoading(false)
                }
            } catch (e) {
                if (!cancelled) {
                    setError(true)
                    setLoading(false)
                }
            }
        }

        load()

        return () => {
            cancelled = true
        }
    }, [])

    if (loading) {
        return (
            <div className="datasets-page">
                <p className="datasets-loading">Loading datasets…</p>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="datasets-page">
                <p className="datasets-error">
                    Couldn't load datasets. Try refreshing.
                </p>
            </div>
        )
    }

    return (
        <div className="datasets-page">
            <header className="datasets-header">
                <h1 className="datasets-title">{data.title}</h1>
                <p className="datasets-tagline">{data.tagline}</p>
                <p className="datasets-intro">{data.intro}</p>
            </header>
            <TableOfContents sections={data.sections} />
            <div className="datasets-sections">
                {data.sections.map((section) => (
                    <SectionBlock key={section.id} section={section} />
                ))}
            </div>
        </div>
    )
}

export default Datasets
