import * as React from 'react'

import { Link } from 'react-router-dom'
import { truncateString } from '../../utils'
import NoImage from '../../../images/no-cover-art.png'

import './styles.scss'
import { Badge, Card, Col, Container, Row } from 'react-bootstrap'

interface IProps {
    title?: string
    description?: string
    author?: string
    categories?: any
    image?: any
    id?: string
}

export default class ResultItem extends React.PureComponent<IProps> {
    static defaultProps = {}

    constructor(props: IProps) {
        super(props)
    }

    renderCategories(categories) {
        let categoryArray = []
        // categories = {
        //     '': '',
        //     '9': 'Business',
        // }
        for (let prop in categories) {
            let category = categories[prop]
            if (category !== '') {
                categoryArray.push(category)
            }
        }
        if (categoryArray.length === 0) {
            return (
                <Badge bg="light" pill className="text-muted">
                    No Categories
                </Badge>
            )
        }
        // Only render a max of 5 categories
        return categoryArray.slice(0, 5).map((cat, i) => (
            <Badge bg="light" pill key={`cat-${i}`} className="text-dark">
                {cat}
            </Badge>
        ))
    }

    render() {
        const { title, description, author, categories, image, id } = this.props
        // const { open } = this.state
        return (
            <Card className="my-3">
                <Card.Body>
                    <Row className="mb-2">
                        <Col xs="4" sm="3" lg="2" className="align-self-center">
                            <Link to={`/podcast/${id}`}>
                                <img
                                    draggable={false}
                                    src={image}
                                    onError={(ev: any) => {
                                        ev.target.src = NoImage
                                    }}
                                    loading="lazy"
                                    className="mw-100 "
                                />
                            </Link>
                        </Col>
                        <Col
                            xs="8"
                            sm="9"
                            lg="10"
                            className="align-self-center"
                        >
                            <h5>
                                <Link to={`/podcast/${id}`}>{title}</Link>
                            </h5>
                            by {author}
                            <div className="mt-2 d-none d-sm-block">
                                {this.renderCategories(categories)}
                            </div>
                        </Col>
                    </Row>
                    <div className="d-sm-none mb-2">
                        {this.renderCategories(categories)}
                    </div>

                    <Card.Text>{truncateString(description)}</Card.Text>
                </Card.Body>
            </Card>
        )
    }
}
