import * as React from 'react'

import './styles.scss'

interface IProps {
    id: number,
}

interface IState {
    showComments: boolean,
    comments: StateComment[] 
}

interface StateComment {
    url: string,
    publishedAt: Date,
    content: string,
    attributedTo: Commenter;
    replies: StateComment[]
}

interface Commenter {
    name: string,
    iconUrl: string,
    url: string,
    account: string
}

interface ICommentProps {
    comment: StateComment 
}

class Comment extends React.PureComponent<ICommentProps> {
    constructor(props) {
        super(props);
    }

    render(): React.ReactNode {
        return (
        <div className='comment'>
            <img className='comment-author-picture' src={this.props.comment.attributedTo.iconUrl}></img>
            <a target="_blank" href={this.props.comment.attributedTo.url}>{this.props.comment.attributedTo.name} ({this.props.comment.attributedTo.account})</a>
            <div dangerouslySetInnerHTML={{__html: this.props.comment.content}}></div>
            <div className='replies'>
            {this.props.comment.replies.map((reply) => <Comment comment={reply}/>)}
            </div>
        </div>
        )
    }
}

export default class Comments extends React.PureComponent<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            showComments: false,
            comments: []
        };
    }
    
    async onClickShowComments() {
        const stateToSet: any = {
            showComments: true
        };

        if(!this.state.comments.length) {
            const response = await fetch('/api/comments/byepisodeid?' + new URLSearchParams({id: String(this.props.id) }));

            const responseBody = await response.json();

            stateToSet.comments = responseBody.roots.map((root) => Comments.buildStateComment(root, responseBody));
        }

        this.setState(stateToSet);
    }

    async onClickHideComments() {
        this.setState({showComments: false});
    }

    private static buildStateComment(commentUrl: string, commentsApiResponseBody): StateComment {
        const node = commentsApiResponseBody.nodes[commentUrl];
        const commenter = commentsApiResponseBody.commenters[node.comment.attributedTo];

        return node && {
            url: node.comment.url,
            publishedAt: new Date(node.comment.published),
            content: node.comment.content.en,
            attributedTo: {
                name: commenter.name,
                iconUrl: commenter.icon.url,
                url: commenter.url,
                account: commenter.fqUsername,
            },
            replies: node.replies.map((reply) => Comments.buildStateComment(reply, commentsApiResponseBody))
        }
    }
    
    render() {
        return (
        <div>
            {!this.state.showComments && <button onClick={() => this.onClickShowComments()}>Show comments</button>}
            {this.state.showComments && <button onClick={() => this.onClickHideComments()}>Hide comments</button>}
            {this.state.showComments && this.state.comments.map((comment) => <Comment comment={comment}/>)}
        </div>
        )
    }
}