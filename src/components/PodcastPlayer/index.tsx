import * as React from 'react'
import AudioPlayer from 'react-h5-audio-player'
// import 'react-h5-audio-player/lib/styles.css';
// import 'react-h5-audio-player/lib/styles.less' Use LESS
import 'react-h5-audio-player/src/styles.scss'

import './styles.scss'

interface IProps {
    title?: string
    children?: any
}

export default class Card extends React.Component<IProps> {
    static defaultProps = {}
    state = {
        open: false,
    }

    constructor(props: IProps) {
        super(props)
    }

    render() {
        const { title, children } = this.props
        let image =
            'https://www.noagendashow.net/media/cache/cover_large/1278.png'
        // const { open } = this.state
        return (
            <div className="player-card">
                <div className="player">
                    <div className="player-cover-art">
                        <img
                            draggable={false}
                            height={450}
                            width={450}
                            src={image}
                        />
                    </div>
                    <div className="player-bottom">
                        <div className="player-media-controls">
                            <AudioPlayer
                                header={
                                    <div className="player-show-title">
                                        <b>The No Agenda Show</b>
                                    </div>
                                }
                                src="https://mp3s.nashownotes.com/NA-1278-2020-09-17-Final.mp3"
                                onPlay={(e) => console.log('onPlay')}
                                customAdditionalControls={[
                                    <div style={{ width: 30 }}></div>,
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
