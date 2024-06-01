import React, { useContext, useEffect, useState } from 'react';
import { BlogContext } from '../pages/blog.page';
import { Link } from 'react-router-dom';
import { UserContext } from '../App';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';

const LikesModal = ({ isOpen, onClose, likedUsers }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-5 flex px-12 md:px-10 items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
                <p className="font-bold text-xl">Liked By</p>
                <button onClick={onClose} className="absolute top-2 right-2 text-2xl">&times;</button>
                <p> </p>
                <ul>
                    {likedUsers.map((user, index) => (
                        <li key={index} className="mb-4">
                        <div className="flex items-center">
                            <img src={user.profile_img} alt={user.username} className="w-10 h-10 rounded-full mr-2" />
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <Link className='underline text-dark-grey' to={`/user/${user.username}`}>@{user.username}</Link>
                            </div>
                        </div>
                    </li>
                    
                    ))}
                </ul>
            </div>
        </div>
    );
};

const BlogInteraction = () => {
    let blogContexData = useContext(BlogContext);
    let { blog, blog: { _id, blog_id, title, activity, activity: { total_likes, total_comments }, author: { personal_info: { username: author_username } } }, setBlog, isLikedByUser, setLikedByUser, setCommentsWrapper } = blogContexData;

    let { userAuth: { username, access_token } } = useContext(UserContext);

    const [isModalOpen, setModalOpen] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);

    useEffect(() => {
        if (access_token) {
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/isLiked-by-user', { _id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data: { result } }) => {
                    setLikedByUser(Boolean(result));
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }, [access_token]);
    

    const handleLike = () => {
        if (access_token) {
            setLikedByUser(prevVal => !prevVal);

            !isLikedByUser ? total_likes++ : total_likes--;
            setBlog({ ...blog, activity: { ...activity, total_likes } });
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/like-blog', {
                _id, isLikedByUser
            }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data }) => {
                    console.log(data);
                })
                .catch(err => {
                    console.log(err);
                });
        }
        else {
            toast.error("Please login to like this blog");
        }
    };
    

    const openModal = async () => {
        const users = await fetchLikedUsers(_id);
        setLikedUsers(users);
        setModalOpen(true);
    };

    const fetchLikedUsers = async (_id) => {
        try {
            const { data } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/blog/${_id}/likes`);
            return data.users; // Assuming the response structure has a 'users' field
        } catch (error) {
            console.error('Error fetching liked users:', error);
            return [];
        }
    };
    

    
    return (
        <>
            <Toaster />
            <LikesModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} likedUsers={likedUsers} />
            <hr className='border-grey my-2' />
            <div className='flex gap-6 justify-between'>
                <div className='flex gap-3 items-center'>
                    <button onClick={handleLike} className={'w-10 h-10 rounded-full flex items-center justify-center ' + (isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80")}>
                        <i className={'fi ' + (isLikedByUser ? 'fi-sr-heart' : 'fi-rr-heart')}></i>
                    </button>
                    <button onClick={openModal} className='text-xl text-dark-grey'>{total_likes}</button>
                    <button onClick={() => setCommentsWrapper(prevVal => !prevVal)} className='w-10 h-10 rounded-full flex items-center justify-center bg-grey/80'>
                        <i className='fi fi-rr-comment-dots'></i>
                    </button>
                    <p className='text-xl text-dark-grey'>{total_comments}</p>
                </div>

                <div className='flex gap-6 items-center'>
                    {
                        username === author_username ?
                            <Link to={`/editor/${blog_id}`} className='underline hover:text-purple'>Edit</Link> : ""
                    }
                    <Link to={`https://stackoverflow.com/ ${title}&url=${location.href}`}><i className="fab fa-stack-overflow text-xl hover:text-twitter"></i></Link>
                </div>
            </div>

            <hr className='border-grey my-2' />
        </>
    );
};

export default BlogInteraction;
