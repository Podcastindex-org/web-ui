import * as React from 'react'
import './styles.scss'
import { requestProvider } from 'webln'
import confetti from 'canvas-confetti'

interface IProps {
    episode?: any
    podcast?: any
    player?: any
}

export default class Boostagram extends React.PureComponent<IProps> {
    constructor(props) {
        super(props)
    }

    state = {
        satAmount: 100,
        boostagram: '',
        destinations: undefined,
        senderName: '',
    }

    componentDidMount() {
        const { episode, podcast } = this.props
        this.setState({
            destinations:
                episode?.value?.destinations || podcast?.value?.destinations,
        })
    }

    handleSatChange = (e: any) => {
        this.setState({
            satAmount: e.target.validity.valid
                ? e.target.value
                : this.state.satAmount,
        })
    }

    handleTextAreaChange = (e: any) => {
        this.setState({
            boostagram: e.target.value,
        })
    }

    handleSenderNameChange = (e: any) => {
        this.setState({
            senderName: e.target.value,
        })
    }

    boost = async () => {
        const { episode, podcast, player } = this.props
        let webln
        let destinations = this.state.destinations

        const getBaseRecord = () => {
            return {
                podcast: podcast?.title,
                feedID: podcast?.id,
                itemID: episode?.id,
                episode: episode?.title,
                ts: Math.trunc(player.current.audio.current.currentTime),
                action: 'boost',
                app_name: 'Podcast Index',
                value_msat: 0,
                value_msat_total: this.state.satAmount * 1000,
                name: undefined,
                message: this.state.boostagram,
                sender_name: this.state.senderName,
            }
        }

        let feesDestinations = destinations.filter((v) => v.fee)
        let splitsDestinations = destinations.filter((v) => !v.fee)
        let runningTotal = this.state.satAmount

        try {
            webln = await requestProvider()
        } catch (err) {
            // Tell the user what went wrong
            alert(
                `${err.message} \r\n Try using Alby ( https://getalby.com/ ) on the Desktop \r\n or installing Blue Wallet ( https://bluewallet.io/ ) \r\n or Blixt Wallet ( https://blixtwallet.github.io/ )  \r\n on your mobile device.`
            )
        }

        if (webln) {
            this.throwConfetti()
            for (const dest of feesDestinations) {
                let feeRecord = getBaseRecord()

                let amount = Math.round(
                    (dest.split / 100) * this.state.satAmount
                )
                if (amount) {
                    runningTotal -= amount
                    feeRecord.name = dest.name
                    feeRecord.value_msat = amount * 1000

                    let customRecords = { '7629169': JSON.stringify(feeRecord) }

                    if (dest.customKey) {
                        customRecords[dest.customKey] = dest.customValue
                    }

                    try {
                        await webln.keysend({
                            destination: dest.address,
                            amount: amount,
                            customRecords: customRecords,
                        })
                    } catch (err) {
                        alert(`error with  ${dest.name}:  ${err.message}`)
                    }
                }
            }

            for (const dest of splitsDestinations) {
                let record = getBaseRecord()
                let amount = Math.round((dest.split / 100) * runningTotal)
                record.name = dest.name
                record.value_msat = amount * 1000
                if (amount >= 1) {
                    let customRecords = { '7629169': JSON.stringify(record) }
                    if (dest.customKey) {
                        customRecords[dest.customKey] = dest.customValue
                    }

                    try {
                        await webln.keysend({
                            destination: dest.address,
                            amount: amount,
                            customRecords: customRecords,
                        })
                    } catch (err) {
                        alert(`error with  ${dest.name}:  ${err.message}`)
                    }
                }
            }
        }
    }

    throwConfetti() {
        let end = Date.now() + 0.1 * 1000

        let colors = [
            '#fa6060',
            '#faa560',
            '#faf760',
            '#b2fa60',
            '#60c1fa',
            '#7260fa',
            '#fa60f2',
        ]

        ;(function frame() {
            confetti({
                particleCount: 12,
                angle: 60,
                spread: 75,
                origin: { x: 0, y: 0.9 },
                colors: colors,
            })
            confetti({
                particleCount: 12,
                angle: 120,
                spread: 75,
                origin: { x: 1, y: 0.9 },
                colors: colors,
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        })()
    }

    render() {
        let boostagram = <div className="boostagram-corner" />
        if (this.state.destinations) {
            boostagram = (
                <div className="boostagram-corner">
                    <textarea
                        value={this.state.boostagram}
                        onChange={this.handleTextAreaChange}
                        placeholder="type your boostagram here"
                    />
                    <div>
                        <div className="boostagram-sender-name">
                            <input
                                type="text"
                                value={this.state.senderName}
                                onChange={this.handleSenderNameChange}
                                onFocus={(e) => e.target.select()}
                                placeholder="Sender's Name"
                            />
                        </div>
                        <div className="boostagram-sat-input">
                            <label>
                                <input
                                    type="text"
                                    pattern="[0-9]*"
                                    value={this.state.satAmount}
                                    onChange={this.handleSatChange}
                                    onFocus={(e) => e.target.select()}
                                />
                                sats
                            </label>
                            <button onClick={this.boost}>Boost</button>
                        </div>
                    </div>
                </div>
            )
        }

        return boostagram
    }
}
