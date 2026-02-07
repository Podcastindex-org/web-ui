import * as React from 'react'
import DOMPurify from 'dompurify'
import Button from '../Button'

import './styles.scss'
import CommentMenu from '../CommentMenu'
import { authenticatedFetch } from '../../utils/auth'

interface IProps {
    id: number,
}

interface IState {
    showComments: boolean,
    loadingComments: boolean,
    comments: StateComment[] 
}

interface StateComment {
    url: string,
    publishedAt?: Date,
    summary?: string,
    content?: string,
    attributedTo?: Commenter,
    replies?: StateComment[],
    commentError?: string,
    repliesError?: string,
    loaded: boolean
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

interface ICommentState {
    showMenu: boolean
}

class Comment extends React.PureComponent<ICommentProps, ICommentState> {
    menuWrapperRef: React.Ref<HTMLDivElement> = React.createRef();
    boundHandleMouseDown: (this: Document, ev: MouseEvent) => any;

    constructor(props) {
        super(props);
        this.state = {
            showMenu: false
        }

        this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    }

    onClickShowMenu() {
        this.setState({showMenu: !this.state.showMenu});
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.boundHandleMouseDown);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.boundHandleMouseDown);
    }

    handleMouseDown(event: MouseEvent) {
        this.closeMenuOnClickOutside(event);
    }

    closeMenuOnClickOutside(event: MouseEvent) {
        // @ts-ignore
        if (this.menuWrapperRef?.current && !this.menuWrapperRef.current.contains(event.target)) {
            
            this.setState({
                showMenu: false,
            })
        }
    }

    render(): React.ReactNode {
        return (
        <details open>
            {!this.props.comment.commentError && this.props.comment.loaded &&
                <summary>
                    <a className='profile' href={this.props.comment.attributedTo.url}>
                        <img className='profile-img' src={this.props.comment.attributedTo.iconUrl || '/images/brand-icon.svg'} />
                        <div className='user'>
                            <strong>{this.props.comment.attributedTo.name}</strong>
                            <span className='handle'>{this.props.comment.attributedTo.account}</span>
                        </div>
                    </a>
                    <a href={this.props.comment.url} className='permalink'>
                        <time>{this.props.comment.publishedAt.toLocaleString()}</time>
                    </a>
                    <button className="context-menu" aria-label="More" onClick={() => this.onClickShowMenu()}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        { this.state.showMenu && 
                            <div ref={this.menuWrapperRef}>
                                <CommentMenu 
                                    url={this.props.comment.url}
                                    commenterUrl={this.props.comment.attributedTo.url}
                                    commenterAccount={this.props.comment.attributedTo.account}
                                />
                            </div>
                        }
                    </button>
                </summary>
            }
            {   this.props.comment.summary ? 
                <div className="contents">
                    <details className="content-warning">
                        <summary>Content Warning Summary</summary>
                        {
                            !this.props.comment.commentError && this.props.comment.content &&
                            <div dangerouslySetInnerHTML={{__html: this.props.comment.content}}/>
                        }
                    </details>
                </div>
                :
                // content can be empty when there are attachments
                !this.props.comment.commentError && this.props.comment.content &&
                <div className="contents" dangerouslySetInnerHTML={{__html: this.props.comment.content}}/>
            }
            {!this.props.comment.loaded && 
                <summary>
                    <a className='profile' href={this.props.comment.url}>
                        <img className='profile-img' src='/images/brand-icon.svg' />
                        <strong>Loading...</strong>
                    </a>
                </summary>
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
                {this.props.comment.replies.map((reply) => <Comment key={reply.url} comment={reply}/>)}
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
            loadingComments: false,
            comments: []
        };
    }
    
    async onClickShowComments() {
        const responseBody = {
            roots: [],
            nodes: {},
            commenters: {}
        };

        if(!this.state.comments.length) {
            this.setState({
                loadingComments: true
            });

            const response = await authenticatedFetch('/api/comments/byepisodeid?' + new URLSearchParams({id: String(this.props.id) }));

            const reader = response.body.getReader();

            const thisComponent = this;

            let incompletePartialResponse: string = '';

            await reader.read().then(function processChunk({done, value}) {
                /**
                 * if everything goes right, value should be singe complete JSON encoded object,
                 * but we have seen that a reverse proxy can mess this up.
                 * Thus, we introduced '\n' as a delimiter, and we assume that value could be also be
                 * fragments of one or more concatenated JSON objects.
                 * e.g.:
                 * '{"root":' - one incomplete JSON object
                 * '{...}\n' - a complete JSON object (indicated by ending in \n)
                 * '{...}\n{"root":' - complete JSON object followed by an incomplete JSON object
                 * '}\n{"root":' - an final fragment of a JSON object followed by an incomplete JSON object
                 */
                if(done) {
                    thisComponent.setState({
                        loadingComments: false
                    });
                    return;
                }

                const decodedValue = new TextDecoder().decode(value);
                let partialResponses = decodedValue.split('\n');

                if(partialResponses.length > 0) {
                    partialResponses[0] = incompletePartialResponse + partialResponses[0];
                    
                    incompletePartialResponse = partialResponses[partialResponses.length-1];

                    partialResponses = partialResponses.slice(0, -1);

                    // normally, at this point partialResponses.length equals 1, but
                    // if multiple chunks were buffered and delivered as one, it could be
                    // > 1

                    if(incompletePartialResponse || partialResponses.length > 1) {
                        console.warn('Comments: Unexpected chunked responses from the comments API - a workaround is in place to ensure functional correctness, but performance is impacted.')
                    }
                }

                const parsedPartialResponses = partialResponses.map((partialResponse) => JSON.parse(partialResponse));
                
                updateResponseBody(responseBody, parsedPartialResponses);

                const stateToSet: any = {
                    showComments: true,
                };

                stateToSet.comments = responseBody.roots.map((root) => Comments.buildStateComment(root, responseBody));
                
                thisComponent.setState(stateToSet);
                return reader.read().then(processChunk);
            });

            function updateResponseBody(responseBody, parsedPartialResponses: Array<any>) {
                parsedPartialResponses.forEach((parsedPartialResponse) => {
                    responseBody.roots = responseBody.roots.concat(parsedPartialResponse.roots);
                    for(let key in parsedPartialResponse.nodes) {
                        responseBody.nodes[key] = parsedPartialResponse.nodes[key];
                    }
                    for(let key in parsedPartialResponse.commenters) {
                        responseBody.commenters[key] = parsedPartialResponse.commenters[key];
                    }
                })
            }
        }
        else {
            this.setState({
                showComments: true
            });
        }
    }

    async onClickHideComments() {
        this.setState({showComments: false});
    }

    private static buildStateComment(commentUrl: string, commentsApiResponseBody): StateComment | null {
        let stateComment: StateComment = {
            url: commentUrl,
            loaded: false
        }

        const node = commentsApiResponseBody.nodes[commentUrl];

        if(!node) {
            return stateComment;
        }

        stateComment.loaded = true;

        const commenter = node.comment && commentsApiResponseBody.commenters[node.comment.attributedTo];

        if(node.comment) {
            const summary = node.comment.summary && DOMPurify.sanitize(Comments.resolveLanguageTaggedValues(node.comment.summary));
            const content = node.comment.content && DOMPurify.sanitize(Comments.resolveLanguageTaggedValues(node.comment.content));

            stateComment = {
                ...stateComment,
                url: node.comment.url,
                publishedAt: new Date(node.comment.published),
                summary: summary,
                content: content,

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

    /**
     * Returns a single value from a an object with multiple language tagged values
     * 
     * Currently, it returns the value of the fist property in languageTaggedValues.
     * In the future, it should return the value of the property that best matches
     * the user's language (navigator.language || navigator.userLanguage), as
     * reference, see https://www.rfc-editor.org/info/bcp47
     * 
     * @example
     * // value will be 'A mensagem'
     * let value = resolveLanguageTaggedValues({pt-BR: 'A mensagem', en: 'The message'})
     * 
     * @param languageTaggedValues 
     * @returns the value of the first property in languageTaggedValues
     */
    private static resolveLanguageTaggedValues(languageTaggedValues): string | null {
        if(!languageTaggedValues) {
            return null;
        }

        for(let propertyName in languageTaggedValues) {
            if(languageTaggedValues.hasOwnProperty(propertyName)) {
                return languageTaggedValues[propertyName];
            }
        }
    }
    
    render() {
        return (
        <div className='comments-container'>
            {!this.state.showComments && <Button disabled={this.state.loadingComments} onClick={() => this.onClickShowComments()}>Show comments</Button>}
            {this.state.showComments && <Button onClick={() => this.onClickHideComments()}>Hide comments</Button>}
            {this.state.loadingComments && <p>Loading comments...</p>}
            {this.state.showComments && this.state.comments.map((comment) => <Comment key={comment.url} comment={comment}/>)}
        </div>
        )
    }
}