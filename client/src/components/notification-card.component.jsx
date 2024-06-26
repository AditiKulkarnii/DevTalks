import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDay } from '../common/date';
import NotificationCommentField from './notification-comment-field.component';
import { UserContext } from '../App';
import axios from 'axios';

const NotificationCard = ({ data, index, notificationState }) => {
    const [isReplying, setRepling] = useState(false);

    const {
        seen, type, reply, replied_on_comment, comment, createdAt, user,
        user: { personal_info: { profile_img, fullname, username: authorUsername } },
        blog: { _id, blog_id, title }, _id: notification_id
    } = data;

    
    const { userAuth: { access_token } } = useContext(UserContext);

    const { notifications, notifications: { results, totalDocs }, setNotifications } = notificationState;

    const handleDeleteClick = (comment_id, type, target) => {
        target.setAttribute('disabled', true);
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment", { _id: comment_id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(() => {
                if (type === 'comment') {
                    results.splice(index, 1);
                } else {
                    delete results[index].reply;
                }
                target.removeAttribute('disabled');
                setNotifications({ ...notifications, results, totalDocs: totalDocs - 1, deletedDocCount: notifications.deletedDocCount + 1 });
            })
            .catch(err => {
                console.log(err);
            });
    };

    

    const handleReplyClick = () => {
        setRepling(prevVal => !prevVal);
    };

    let notificationMessage;

    notificationMessage = type === 'like' ? 'liked the post' : (type === 'comment' ? 'commented on the post' : 'replied to the comment on the post');

    return (
        <div className={'p-6 border-b border-grey border-l-black ' + (!seen ? 'border-l-2' : '')}>
            <div className='flex gap-5 mb-3'>
                <img src={profile_img} alt='profile_img' className='w-14 h-14 flex-none rounded-full' />
                <div className='w-full '>
                    <h1 className='text-xl font-medium text-dark-grey'>
                        <span className='lg:inline-block hidden capitalize'>{fullname}</span>
                        <Link className='mx-1 text-black underline' to={`/user/${authorUsername}`}>@{authorUsername}</Link>
                        <span className='font-normal'>
                            {notificationMessage}
                        </span>
                    </h1>

                    {
                        type === 'reply' ?
                            <div className='p-4 mt-4 rounded-md bg-grey'>
                                <p>{replied_on_comment.comment}</p>
                            </div>
                            :
                            <Link to={`/blog/${blog_id}`} className='font-medium text-dark-grey hover:underline line-clamp-1'>
                                {`"${title}"`}
                            </Link>
                    }
                </div>
            </div>

            {
                type !== 'like' ?
                    <p className='ml-14 pl-5 font-gelasio text-xl my-5'>{comment.comment}</p>
                    : ""
            }

            <div className='ml-14 pl-5 mt-3 text-dark-grey flex gap-8'>
                <p>{getDay(createdAt)}</p>

                {
                    type !== 'like' ?
                        <>
                            {
                                !reply && <button onClick={handleReplyClick} className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/80 hover:bg-grey/60'>
                                    <i className='fi fi-rr-comment-dots'></i>
                                </button>
                            }
                            <button onClick={(e) => handleDeleteClick(comment._id, 'comment', e.target)} className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/80 hover:bg-grey/60'>
                                <i className='fi fi-rr-trash'></i>
                            </button>
                        </>
                        : ""
                }
            </div>

            {
                isReplying ?
                    <div className='mt-8'>
                        <NotificationCommentField _id={_id} blog_author={user} index={index} replyingTo={comment._id} setReplying={setRepling} notification_id={notification_id} notificationData={notificationState} />
                    </div>
                    : ""
            }

            {
                reply ?
                    <div className='ml-20 p-5 bg-grey mt-5 rounded-md '>
                        <div className='flex gap-3 mb-3'>
                            
                            <div>
                                <h1 className='font-medium text-xl text-dark-grey'>
                                {reply.user && reply.username && reply.username &&
                                        <Link className='mx-1 text-black underline' to={`/user/${reply.blog_author}`}>
                                            @{reply.blog_author}
                                        </Link>
                                    }
                                    <span className='font-normal'>replied to</span>
                                    <span></span>
                                    {/* <img src={profile_img} alt="" className='w-8 h-8 rounded-full' /> */}
                                    <Link className='mx-1 text-black underline' to={`/user/${authorUsername}`}>
                                        @{authorUsername}
                                    </Link>
                                </h1>
                            </div>
                        </div>
                        <p className='ml-14 font-gelasio text-xl my-2'>{reply.comment}</p>
                        <button onClick={(e) => handleDeleteClick(comment._id, 'reply', e.target)} className='ml-14 mt-2 underline hover:text-black'>Delete</button>
                    </div>
                    :
                    ""
            }

        </div>
    );
};

export default NotificationCard;
