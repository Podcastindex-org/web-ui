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

  getLnAddressParts(dest: any): [string, string] | null {
    const match = dest.address.toLowerCase().match(/^([a-z0-9._-]+)@([a-z0-9.-]+)$/);
    return match ? [match[1], match[2]] : null;
  }

  getLink(dest: any): string {
    if (dest.type === "lnaddress") {
      const parts = this.getLnAddressParts(dest);

      if (parts) {
        const [ username, domain ] = parts;
        // "lightning:" is intercepted by wallet extensions (e.g. Alby) the
        // same way "mailto:" is intercepted by a mail client, so this is
        // the more useful click target than the raw well-known URL. See
        // https://github.com/Podcastindex-org/web-ui/issues/494
        return "lightning:" + username + "@" + domain;
      }
    }

    return "https://amboss.space/node/" + dest.address;
  }

  // For lnaddress destinations, a secondary link to the raw LNURL-pay
  // well-known JSON, for anyone without a wallet extension who wants to
  // inspect the payment endpoint directly.
  getWellKnownLink(dest: any): string | null {
    if (dest.type !== "lnaddress") {
      return null;
    }

    const parts = this.getLnAddressParts(dest);
    if (!parts) {
      return null;
    }

    const [ username, domain ] = parts;
    return "https://" + domain + "/.well-known/lnurlp/" + username;
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
          {destinations.map(dest => {
            const wellKnownLink = this.getWellKnownLink(dest)

            return (
              <li key={dest.name}>
                <progress value={dest.split} max={splitTotal} title={dest.address}></progress>
                {knownDeadNodes[dest.address] && <span title={`This ${knownDeadNodes[dest.address]} wallet is no longer active. If this is your feed, please update it with a new wallet address.`}>⚠️</span>}
                <a target="_blank" href={this.getLink(dest)}>{dest.name}</a>
                {wellKnownLink &&
                  <a
                    className="lnaddress-details"
                    target="_blank"
                    href={wellKnownLink}
                    title="View Lightning Address details (LNURL-pay well-known endpoint)"
                  >ⓘ</a>
                }
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}
