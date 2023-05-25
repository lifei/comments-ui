import React, {useContext} from 'react';
import AppContext from '../../../AppContext';

const AuthorContextMenu = ({comment, close, toggleEdit}) => {
    const {dispatchAction} = useContext(AppContext);

    const deleteComment = (event) => {
        dispatchAction('deleteComment', comment);
        close();
    };

    return (
        <div className="flex flex-col">
            <button type="button" className="mb-3 w-full text-left text-[14px]" onClick={toggleEdit} data-testid="edit">
                编辑
            </button>
            <button type="button" className="w-full text-left text-[14px] text-red-600" onClick={deleteComment}>
                删除
            </button>
        </div>
    );
};

export default AuthorContextMenu;
