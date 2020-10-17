import * as React from 'react'

import './styles.scss'


export default class DonationThankYou extends React.PureComponent {
    render() {
    	return (
			<div className="page-content">
				<h1>Thank you!</h1>
            	<p>It's people like you that help keeps podcasting as a platform for free speech possible.</p>
				<p><a href="/">Back to the home page</a></p>
			</div>
        )
    }
}
