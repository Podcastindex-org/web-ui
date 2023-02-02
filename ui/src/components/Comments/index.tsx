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
    publishedAt?: Date,
    content?: string,
    attributedTo?: Commenter;
    replies?: StateComment[]
    commentError?: string,
    repliesError?: string
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
        <details open>
            {!this.props.comment.commentError &&
                <summary>
                    <a className='profile' href={this.props.comment.attributedTo.url}>
                        <img className='profile-img' src={this.props.comment.attributedTo.iconUrl || '/images/brand-icon.svg'} />
                        <strong>{this.props.comment.attributedTo.name}</strong>
                        <span>{this.props.comment.attributedTo.account}</span>
                    </a>
                    <span aria-hidden="true">·</span>
                    <a href={this.props.comment.url} className='permalink'>
                        <time>{this.props.comment.publishedAt.toLocaleString()}</time>
                    </a>
                </summary>
            }
            {
                // content can be empty when there are attachments
                !this.props.comment.commentError && this.props.comment.content &&
                <div className="contents" dangerouslySetInnerHTML={{__html: this.props.comment.content}}/>
            }
            {this.props.comment.commentError && 
                <summary>
                    <a className='profile' href={this.props.comment.url}>
                        <img className='profile-img' src='/images/brand-icon.svg' />
                        <strong>Error loading this comment</strong>
                    </a>
                </summary>
            }
            {!this.props.comment.repliesError && this.props.comment.replies && <div>
                {this.props.comment.replies.map((reply) => <Comment comment={reply}/>)}
            </div>}
            {
                this.props.comment.repliesError && <div className='contents'>Error loading replies for this comment</div>
            }
        </details>
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

    private static buildStateComment(commentUrl: string, commentsApiResponseBody): StateComment | null {
        const node = commentsApiResponseBody.nodes[commentUrl];

        if(!node) {
            return null;
        }

        const commenter = node.comment && commentsApiResponseBody.commenters[node.comment.attributedTo];

        let stateComment: StateComment = {
            url: commentUrl
        }

        if(node.comment) {
            stateComment = {
                ...stateComment,
                url: node.comment.url,
                publishedAt: new Date(node.comment.published),
                content: node.comment.content.en,

                attributedTo: commenter && {
                    name: commenter.name,
                    iconUrl: commenter.icon?.url,
                    url: commenter.url,
                    account: commenter.fqUsername,
                }
            }
        }
        else {
            console.warn('There was an error on the server fetching a comment', node.commentError);
            stateComment.commentError = node.commentError;
        }

        if(node.replies) {
            stateComment = {
                ...stateComment,
                replies: node.replies.map((reply) => Comments.buildStateComment(reply, commentsApiResponseBody))
            }
        }
        else {
            console.warn('There was an error on the server fetching a replies to a comment', node.repliesError);
            stateComment.repliesError = node.repliesError
        }

        return stateComment;
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