import React, { useContext } from 'react'
import AnimationWrapper from '../common/page-animation'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import { removeFromSession } from '../common/session'
import { toast, Toaster } from 'react-hot-toast'

const UserNavigationPanel = () => {
    const { userAuth: { username }, setUserAuth } = useContext(UserContext)
    const navigate = useNavigate();

    const handleSignOut = () => {
        removeFromSession("user");
        setUserAuth({ access_token: null });
        toast.success("Signed Out!", { duration: 1000 });
        navigate('/');
    }

    return (
        <AnimationWrapper transition={{ duration: 0.2 }} className="absolute right-0 z-50">
            <Toaster />
            <div className='bg-white absolute right-0 border-grey w-60 duration-200 '>
                <Link to='/editor' className='flex gap-2 link md:hidden pl-8 py-4 '>
                    <i className='fi fi-rr-file-edit'></i>
                    <p>Write</p>
                </Link>
                <Link to={`/user/${username}`} className='link pl-8 py-4 '>
                    Profile
                </Link>
                <Link to={`/dashboard/blogs`} className='link pl-8 py-4 '>
                    Dashboard
                </Link>
                <Link to={`/settings/edit-profile`} className='link pl-8 py-4 '>
                    Settings
                </Link>
                <span className='absolute border-t border-grey w-[100%]'></span>

                <button className='text-left hover:bg-grey w-full pl-8 py-4'
                    onClick={handleSignOut}
                >
                    <h1 className=' text-xl mb-1'>Sign Out</h1>
                    <p className='text-dark-grey'>@{username}</p>
                </button>
            </div>
        </AnimationWrapper>
    )
}

export default UserNavigationPanel
