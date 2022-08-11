import React, {useContext, useEffect, useState} from 'react';
import {Transition} from '@headlessui/react';
import Avatar from './Avatar';
import Like from './Like';
import Reply from './Reply';
import More from './More';
import Form from './Form';
import Replies from './Replies';
import AppContext from '../AppContext';
import {formatRelativeTime, formatExplicitTime} from '../utils/helpers';

function EditedInfo({comment}) {
    if (!comment.edited_at) {
        return null;
    }
    return (
        <span>
            <span className="mx-[0.3em]">·</span>Edited
        </span>
    );
}

const Comment = ({updateIsEditing = null, isEditing, ...props}) => {
    const [isInEditMode, setIsInEditMode] = useState(false);
    const [isInReplyMode, setIsInReplyMode] = useState(false);
    const {admin, avatarSaturation, member, commentsEnabled, dispatchAction} = useContext(AppContext);
    let comment = props.comment;

    useEffect(() => {
        updateIsEditing?.(isInReplyMode || isInEditMode);
    }, [updateIsEditing, isInReplyMode, isInEditMode]);
    const toggleEditMode = () => {
        setIsInEditMode(current => !current);
    };

    const closeEditMode = () => {
        setIsInEditMode(false);
    };

    const toggleReplyMode = async () => {
        if (!isInReplyMode) {
            // First load all the replies before opening the reply model
            await dispatchAction('loadMoreReplies', {comment, limit: 'all'});
        }
        setIsInReplyMode(current => !current);
    };

    const closeReplyMode = () => {
        setIsInReplyMode(false);
    };

    const hasReplies = comment.replies && comment.replies.length > 0;
    const isNotPublished = comment.status !== 'published';
    const html = {__html: comment.html};

    let notPublishedMessage;
    if (isNotPublished) {
        if (admin && comment.status === 'hidden') {
            notPublishedMessage = 'This comment has been hidden.';
        } else {
            notPublishedMessage = 'This comment has been removed.';
        }
    }

    const paidOnly = commentsEnabled === 'paid';
    const isPaidMember = member && !!member.paid;
    const canReply = member && (isPaidMember || !paidOnly);

    // If this comment is from the current member, always override member
    // with the member from the context, so we update the bio in existing comments when we change it
    const memberBio = member && comment.member && comment.member.uuid === member.uuid ? member.bio : comment?.member?.bio;

    if (isInEditMode) {
        return (
            <Form comment={comment} close={closeEditMode} parent={props.parent} isEdit={true} />
        );
    } else {
        return (
            <Transition
                appear
                show={true}
                enter="transition-opacity duration-300 ease-out"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className={`flex flex-row w-full ${hasReplies ? 'mb-2 sm:mb-2' : 'mb-6 sm:mb-10'}`}>
                    <div className="mr-3 flex flex-col justify-start items-center">
                        <div className="flex-0 mb-4">
                            <Avatar comment={comment} saturation={avatarSaturation} isBlank={isNotPublished} />
                        </div>
                        {/* {!props.isReply && <div className="w-[3px] h-full bg-gradient-to-b from-neutral-100 via-neutral-100 to-transparent grow rounded" />} */}
                    </div>
                    <div className="grow">
                        <div className="flex items-start -mt-[3px] mb-2">
                            {isNotPublished ?
                                <div>
                                    <p className="font-sans text-[16px] leading-normal text-neutral-400 italic mt-[4px]">{notPublishedMessage}</p>
                                </div> :
                                <div>
                                    <h4 className="text-[17px] font-sans font-bold tracking-tight text-[rgb(23,23,23] dark:text-[rgba(255,255,255,0.85)]">{!comment.member ? 'Deleted member' : (comment.member.name ? comment.member.name : 'Anonymous')}</h4>
                                    <div className="flex items-baseline font-sans text-[14px] tracking-tight pr-4 text-neutral-400 dark:text-[rgba(255,255,255,0.5)]">
                                        <span className="inline-block max-w-full text-ellipsis overflow-hidden ...">
                                            {memberBio && <span>{memberBio}<span className="mx-[0.3em]">·</span></span>}
                                            <span title={formatExplicitTime(comment.created_at)}>{formatRelativeTime(comment.created_at)}</span>
                                            <EditedInfo comment={comment} />
                                        </span>
                                    </div>
                                </div>}
                        </div>

                        {!isNotPublished &&
                        <div className={`mb-2 pr-4`}>
                            <p dangerouslySetInnerHTML={html} className="gh-comment-content font-sans leading-normal text-[16px] text-neutral-900 dark:text-[rgba(255,255,255,0.85)]"></p>
                        </div>}

                        <div className="flex gap-5 items-center">
                            {!isNotPublished && <Like comment={comment} />}
                            {!isNotPublished && (canReply && (isNotPublished || !props.parent) && <Reply disabled={!!isEditing} comment={comment} toggleReply={toggleReplyMode} isReplying={isInReplyMode} />)}
                            <More comment={comment} toggleEdit={toggleEditMode} disableEditing={isEditing} />
                        </div>

                        {hasReplies &&
                            <div className="mt-8 sm:mt-10 mb-4 sm:mb-0">
                                <Replies comment={comment} />
                            </div>
                        }

                        {isInReplyMode && 
                            <div className="my-10">
                                <Form parent={comment} close={closeReplyMode} isReply={true} />
                            </div>
                        }
                    </div>
                </div>
            </Transition>
        );
    }
};

export default Comment;
