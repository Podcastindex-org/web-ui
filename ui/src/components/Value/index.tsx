import * as React from 'react'

import { titleizeString } from '../../utils'
import './styles.scss'

interface IProps {
  model: {
    type: string
    method: string
    suggested: string
  }
  destinations?: Array<{
    name: string
    type: string
    address: string
    split: string
  }>
}

type PodState = { copyMessage: string };

export default class Value extends React.PureComponent<IProps, PodState> {

  constructor(props) {
    super(props);
  }

  render() {
    const { destinations, model } = this.props
    const splitTotal = destinations ? destinations.reduce((total, d) => total + parseInt(d.split, 10), 0) : null

    if (destinations && destinations.length > 1 && destinations[(destinations.length - 1)].name.toLowerCase() === "podcastindex.org") {
      destinations.pop();
    }

    return (
      <div className="podcast-value">
        <h4>Value for Value via {titleizeString(model.type)}</h4>
        <ul>
          {destinations.map(dest => (
            <li key={dest.name}>
              <progress value={dest.split} max={splitTotal} title={dest.address}></progress> <a target="_blank" href={"https://amboss.space/node/" + dest.address}>{dest.name}</a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}
