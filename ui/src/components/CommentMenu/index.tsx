import * as React from 'react'

import './styles.scss'

interface ICommentMenuProps {
    /**
     * URL of the comment
     */
    url: string,
    commenterUrl: string,
    commenterAccount: string,
}

interface ICommentMenuState {

}

class CommentMenu extends React.PureComponent<ICommentMenuProps, ICommentMenuState> {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

    onClickCopyLink(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        e.preventDefault();
        navigator.clipboard.writeText(this.props.url);
        
        // Some form of "toast message" would be better, but I don't
        // think something like that is already implemented, meanwhile,
        // we use an alert, it is ugly, but it show the user there was
        // a reaction.
        alert('Link to post copied');
    }

    render(): React.ReactNode {
        return (
            <menu>
                <a href={this.props.url}>Reply to this post</a>
                <a href={this.props.url} onClick={(e) => this.onClickCopyLink(e)}>Copy link to this post</a>
                <a href={this.props.url} target='_blank'>Open in original site</a>
                <a href={this.props.commenterUrl}>Follow {this.props.commenterAccount}</a>
            </menu>
        )
    }
}

export default CommentMenu;