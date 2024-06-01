import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaShareAlt } from 'react-icons/fa'
import { WhatsappIcon, WhatsappShareButton, EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton } from 'react-share'
import AnimationWrapper from '../common/page-animation'
import Loader from '../components/loader.component'
import { getDay } from '../common/date'
import BlogInteraction from '../components/blog-interaction.component'
import BlogPostCard from '../components/blog-post.component'
import BlogContent from '../components/blog-content.component'
import CommentContainer, { fetchComment } from '../components/comments.component'
import { FaStackOverflow } from 'react-icons/fa'

export const blogStructure = {
    title: '',
    des: '',
    content: [],
    author: {
        personal_info: {},
    },
    banner: '',
    publishedAt: '',
}

export const BlogContext = createContext({})
const BlogPage = () => {
    let { blog_id } = useParams()
    const [blog, setBlog] = useState(blogStructure)
    const [similarBlog, setSimilarBlog] = useState(blogStructure)
    const [loading, setLoading] = useState(true)
    const [isLikedByUser, setLikedByUser] = useState(false)
    const [commentsWrapper, setCommentsWrapper] = useState(false)
    const [totalParentComentsLoaded, setTotalCommentsLoaded] = useState(0)
    const [showShareOptions, setShowShareOptions] = useState(false)
    const shareUri = window.location.origin + '/blog/' + blog_id;
    

    let { title, content, banner, author: { personal_info: { username: author_username, fullname, profile_img } }, publishedAt } = blog

    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-blog', { blog_id })
            .then(async ({ data: { blog } }) => {
                blog.comments = await fetchComment({ blog_id: blog._id, setParentCommentCountFun: setTotalCommentsLoaded })

                setBlog(blog)

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/search-blogs', { tag: blog.tags[0], limit: 6, eliminate_blog: blog_id })
                    .then(({ data: { blogs } }) => {
                        setSimilarBlog(blogs)
                    })
                    .catch(err => {
                        console.log(err)
                    })
                setLoading(false)
            })
            .catch(err => {
                console.log(err)
                setLoading(false)
            })
    }
    useEffect(() => {
        resetState()
        fetchBlog()
    }, [blog_id])
    const resetState = () => {
        setBlog(blogStructure)
        setSimilarBlog(null)
        setLoading(true)
        setLikedByUser(false)
        setTotalCommentsLoaded(0)
    }

    const toggleShareOptions = () => {
        setShowShareOptions(!showShareOptions)
    }

    const handleStackOverflowShare = () => {
        const shareUrl = `https://stackoverflow.com/share?url=${encodeURIComponent(shareUri)}&title=${encodeURIComponent(title)}`;
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    

    return (
        <AnimationWrapper>
            {
                loading ? <Loader /> :
                    <BlogContext.Provider value={{ blog, setBlog, isLikedByUser, setLikedByUser, commentsWrapper, setCommentsWrapper, totalParentComentsLoaded, setTotalCommentsLoaded }}>
                        <CommentContainer />
                        <div className='max-w-[900px] center py-10 max-lg:px-[5vw]'>
                            <div className="relative">
                                <img src={banner} alt="Banner" className='aspect-video' />
                                <div className='absolute top-2 right-2 flex items-center'>
                                    <FaShareAlt 
                                        className='text-gray-500 text-2xl cursor-pointer hover:text-gray-900'
                                        onClick={toggleShareOptions}
                                    />
                                    {showShareOptions && (
                                    
                                        <div className='flex flex-col gap-2 ml-2 bg-white p-2 rounded shadow-lg'>
                                            <WhatsappShareButton url={shareUri} title={title}>
                                                <WhatsappIcon size={32} round />
                                            </WhatsappShareButton>
                                            <EmailShareButton url={shareUri} subject={title} body={blog.des}>
                                                <EmailIcon size={32} round />
                                            </EmailShareButton>
                                            <FacebookShareButton url={shareUri} quote={title}>
                                                <FacebookIcon size={32} round />
                                            </FacebookShareButton>
                                            <button onClick={handleStackOverflowShare}>
                                                <FaStackOverflow size={32} round />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='mt-12'>
                                <h2>{title}</h2>
                                <div className='flex max-sm:flex-col justify-between my-8'>
                                    <div className='flex gap-5 items-start '>
                                        <img src={profile_img} alt="Author" className='w-12 h-12 rounded-full' />
                                        <p className='capitalize '>
                                            {fullname}
                                            <br />
                                            @
                                            <Link className="underline" to={`/user/${author_username}`}>{author_username}</Link>
                                        </p>

                                    </div>
                                    <p className='text-dark-grey opacity-75 max-sm:mt-6 mx-sm:ml-12 max-sm:pl-5'>Published on {getDay(publishedAt)}</p>
                                </div>
                            </div>

                            <BlogInteraction />

                            <div className='my-12 font-gelasio blog-page-content'>
                                {
                                    content[0].blocks.map((block, i) => {
                                        return <div className='my-4 md:my-8' key={i}>
                                            <BlogContent block={block} />
                                        </div>
                                    })
                                }

                            </div>

                            {/* <BlogInteraction /> */}

                            {
                                similarBlog !== null && similarBlog.length ?
                                    <>
                                        <h1 className='font-medium text-2xl mt-14 mb-10'>Similar Blogs</h1>
                                        {
                                            similarBlog && similarBlog.map((blog, i) => {
                                                
                                                let { author: { personal_info } } = blog
                                                return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                                                    <BlogPostCard content={blog} author={personal_info} />
                                                </AnimationWrapper>
                                            })
                                        }
                                    </>
                                    : ""
                            }

                        </div>
                    </BlogContext.Provider>
            }
        </AnimationWrapper>
    )
}

export default BlogPage
