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

  getLink(dest: any): string {
    if (dest.type === "lnaddress") {
      const match = dest.address.toLowerCase().match(/^([a-z0-9._-]+)@([a-z0-9.-]+)$/);

      if (match) {
        const [ _, username, domain ] = match;
        return "https://" + domain + "/.well-known/lnurlp/" + username;
      }
    }

    return "https://amboss.space/node/" + dest.address;
  }

  render() {
    const { destinations, model } = this.props
    const splitTotal = destinations ? destinations.reduce((total, d) => total + parseInt(d.split, 10), 0) : null

    if (destinations && destinations.length > 1 && destinations[(destinations.length - 1)].name.toLowerCase() === "podcastindex.org") {
      destinations.pop();
    }

    // list of old node addresses for alby and fountain
    const knownDeadNodes = {
      "030a58b8653d32b99200a2334cfe913e51dc7d155aa0116c176657a4f1722677a3": "Alby",
      "0332d57355d673e217238ce3e4be8491aa6b2a13f95494133ee243e57df1653ace": "Fountain",
      "03bc290b26637eb8f25de69fca83c85c014796aa03d90bf0d4c03c18947e12127d": "Fountain"
    }

    return (
      <div className="podcast-value">
        <h4>Value for Value via {titleizeString(model.type)}</h4>
        <ul>
          {destinations.map(dest => (
            <li key={dest.name}>
              <progress value={dest.split} max={splitTotal} title={dest.address}></progress>
              {knownDeadNodes[dest.address] && <span title={`This ${knownDeadNodes[dest.address]} wallet is no longer active. If this is your feed, please update it with a new wallet address.`}>⚠️</span>}
              <a target="_blank" href={this.getLink(dest)}>{dest.name}</a>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}
