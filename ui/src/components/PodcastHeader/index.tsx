import * as React from 'react'
import Button from "../Button";

import Value from '../Value'
import NoImage from '../../../images/no-cover-art.png'
import { truncateString } from '../../utils'
import RSSLogo from "../../../images/feed.svg";
import EpisodesFMLogo from "../../../images/episodesfm.svg";
import PodcastAPLogo from "../../../images/podcastap.svg";
import DonationPage from "../../../images/donation-page.svg";
import EarthLogo from "../../../images/earth.svg";
import LightningLogo from "../../../images/lightning.svg"
import './styles.scss'

interface IProps {
    title?: string
    description?: string
    author?: string
    categories?: any
    image?: any
    id?: string
    itunesId?: string
    feedURL?: string
    podcastURL?: string
    donationPageURL?: string
    value?: {
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
}

type PodState = { copyMessage: string };

export default class PodcastHeader extends React.PureComponent<IProps, PodState> {

    constructor(props) {
        super(props);
        this.state = {copyMessage: "Copy RSS"};
      }

      copyClicked = () => {
        navigator.clipboard.writeText(this.props.feedURL)
        this.setState({copyMessage: "Copied!"});
        setTimeout(() => {
            this.setState({
            copyMessage: "Copy RSS"
          })
        }, 1833); // 18 = happy Jewish number, 33 = magic number of No Agenda
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
                <div className="podcast-header-category no-category">No Categories</div>
            )
        }
        // Only render a max of 5 categories
        return categoryArray.slice(0, 5).map((cat, i) => (
            <div key={`cat-${i}`} className="podcast-header-category">
                {cat}
            </div>
        ))
    }

    render() {
        const {title, description, author, categories, image, id, feedURL, donationPageURL, podcastURL, value, itunesId} = this.props
        const splitTotal = value && value.destinations ? value && value.destinations.reduce((total, d) => total + parseInt(d.split, 10), 0): null

        if(value && value.destinations && value.destinations.length > 1 && value.destinations[(value.destinations.length - 1)].name.toLowerCase() === "podcastindex.org") {
            value.destinations.pop();
        }

        return (
            <div className="podcast-header">
                <h1 className="podcast-header-title">{title}</h1>
                <div className="podcast-header-row">
                    <div className="podcast-header-cover-art">
                        <img
                            draggable={false}
                            src={image}
                            onError={(ev: any) => {
                                ev.target.src = NoImage
                            }}
                        />
                    </div>
                    <div className="podcast-header-info">
                        <address>By: {author}</address>
                        <div className="podcast-header-categories">
                            {this.renderCategories(categories)}
                        </div>
                        <p className="podcast-header-description">
                            {truncateString(description)}
                        </p>
                        <div className="podcast-header-external-links">
                            {podcastURL ?
                                <a
                                    href={podcastURL}
                                    title="Podcast Website"
                                    target="_blank"
                                >
                                    <img
                                        src={EarthLogo}/>
                                </a>
                                : ""
                            }
                            {feedURL ?
                                <a
                                    href={feedURL}
                                    title="RSS Feed"
                                    target="_blank"
                                >
                                    <img src={RSSLogo}/>
                                </a>
                                : ""
                            }
                            {donationPageURL ?
                                <a
                                    href={donationPageURL}
                                    title="Donation Page"
                                    target="_blank"
                                >
                                    <img src={DonationPage}/>
                                </a>
                                : ""
                            }
                            {!value && feedURL ?
                                <a
                                    href={"https://podcasterwallet.com/?pcid=" + id}
                                    title="Claim this feed on Podcasterwallet.com"
                                    target="_blank"
                                    id="aLightningClaim"
                                >
                                    <img src={LightningLogo}/>
                                </a>
                                : ""
                            }
                            {itunesId ?
                                <a
                                    href={`https://episodes.fm/${itunesId}`}
                                    title="Follow in your podcast app"
                                    target="_blank"
                                >
                                    <img src={EpisodesFMLogo} />
                                </a>
                                : ''
                            }
                            <a
                                href={`https://podcastap.com/feed/${id}`}
                                title="Follow on Activity Pub via Podcast AP"
                                target="_blank"
                            >
                                <img src={PodcastAPLogo} />
                            </a>
                            {feedURL ?
                                <Button small={true} onClick={this.copyClicked}>{ this.state.copyMessage }</Button>
                                : ""
                            }
                        </div>
                        {value && <Value {...value} />}
                    </div>
                </div>
            </div>
        )
    }
}
