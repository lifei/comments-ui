import React from 'react';
import AppContext from '../../AppContext';
import AdminContextMenu from './AdminContextMenu';
import AuthorContextMenu from './AuthorContextMenu';
import NotAuthorContextMenu from './NotAuthorContextMenu';

class CommentContextMenu extends React.Component {
    static contextType = AppContext;

    constructor(props) {
        super(props);
        this.state = {};

        this.close = this.close.bind(this);
    }

    get isAuthor() {
        return this.props.comment.member.uuid === this.context?.member?.uuid;
    }

    get isAdmin() {
        return !!this.context.admin;
    }

    close() {
        this.props.close();
    }

    render() {
        const comment = this.props.comment;

        return (
            <div className="bg-white absolute font-sans rounded py-3 px-4 drop-shadow-xl text-sm whitespace-nowrap">
                {this.isAuthor && comment.status === 'published' ? <AuthorContextMenu comment={comment} close={this.close} toggleEdit={this.props.toggleEdit} /> : (this.isAdmin ? <AdminContextMenu comment={comment} close={this.close}/> : <NotAuthorContextMenu comment={comment} close={this.close}/>)}
            </div>
        );
    }
}
  
export default CommentContextMenu;