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
    interactorAccount?: string,
}

class CommentMenu extends React.PureComponent<ICommentMenuProps, ICommentMenuState> {
    constructor(props) {
        super(props);
        this.state = {
            interactorAccount: localStorage.getItem('commentsInteractorAccount')
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

    async onClickReply(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): Promise<void> {
        e.preventDefault();

        const remoteInteractUrlPattern = await this.fetchRemoteInteractUrlPattern();

        if(!remoteInteractUrlPattern) {
            // TODO: error handling
        }

        // alert(remoteInteractUrlPattern);
        const remoteInteractUrl = remoteInteractUrlPattern.replace('{uri}', encodeURI(this.props.url));
        window.open(remoteInteractUrl, '_blank');
    }

    async onClickFollow(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): Promise<void> {
        e.preventDefault();
        
        const remoteInteractUrlPattern = await this.fetchRemoteInteractUrlPattern();

        if(!remoteInteractUrlPattern) {
            // TODO: error handling
        }

        // alert(remoteInteractUrlPattern);
        const remoteInteractUrl = remoteInteractUrlPattern.replace('{uri}', encodeURI(CommentMenu.stripLeadingAt(this.props.commenterAccount)));
        window.open(remoteInteractUrl, '_blank');
    }

    async fetchRemoteInteractUrlPattern(): Promise<string> {
        let interactorAccount = localStorage.getItem('commentsInteractorAccount');

        if(!interactorAccount) {
            interactorAccount = prompt('What is your Fediverse account?');

            if(interactorAccount) {
                localStorage.setItem('commentsInteractorAccount', interactorAccount);
            }
        }

        if(!interactorAccount) {
            return;
        }

        let remoteInteractUrlPattern = localStorage.getItem('commentsRemoteInteractUrlPattern');

        if(!remoteInteractUrlPattern) {
            const response = await fetch('/api/comments/remoteInteractUrlPattern?' + new URLSearchParams({
                interactorAccount: interactorAccount
            }));

            const parsedResponse = await response.json();

            remoteInteractUrlPattern = parsedResponse.remoteInteractUrlPattern;

            if(remoteInteractUrlPattern) {
                localStorage.setItem('commentsRemoteInteractUrlPattern', remoteInteractUrlPattern);
            }
        }

        return remoteInteractUrlPattern;
    }

    static stripLeadingAt(account: string) {
        return account.substring(1);
    }

    onClickForgetHomeInstanceHost(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void {
        e.preventDefault();

        localStorage.removeItem('commentsInteractorAccount');
        localStorage.removeItem('commentsRemoteInteractUrlPattern');
        
        this.setState({
            interactorAccount: undefined
        });
    }

    render(): React.ReactNode {
        return (
            <menu>
                <a href={this.props.url} target='_blank' onClick={(e) => this.onClickReply(e)}>Reply to this post</a>
                <a href={this.props.url} onClick={(e) => this.onClickCopyLink(e)}>Copy link to this post</a>
                <a href={this.props.url} target='_blank'>Open in original site</a>
                <a href={this.props.commenterUrl} target='_blank' onClick={(e) => this.onClickFollow(e)}>Follow {this.props.commenterAccount}</a>
                {this.state.interactorAccount && 
                    <a onClick={(e) => this.onClickForgetHomeInstanceHost(e)}>Forget {this.state.interactorAccount}</a>
                }
            </menu>
        )
    }
}

export default CommentMenu;