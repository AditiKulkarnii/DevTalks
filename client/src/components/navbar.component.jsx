import { useContext, useEffect, useState } from 'react';
import darkLogo from '../imgs/logo-light-new.png';
import lightLogo from '../imgs/logo-dark-new.png';
import {Link, Outlet, useNavigate} from 'react-router-dom';
import { ThemeContext, UserContext } from '../App';
import UserNavigationPanel from './user-navigation.component';
import axios from 'axios';
import { storeInSession } from '../common/session';
import {toast} from 'react-hot-toast';
const Navbar = () =>{
    const navigate = useNavigate()
    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
    const [userNavPanel, setUserNavPanel] = useState(false);
    const [activeButton, setActiveButton] = useState('signin');

    let {theme, setTheme} = useContext(ThemeContext)
    const {userAuth, userAuth: {access_token, profile_img, new_notification_available}, setUserAuth} = useContext(UserContext);
    const handleUserNavPanel  = () =>{
        setUserNavPanel(currentVal => !currentVal)
    }
    const handleBlur = () =>{
        setTimeout(()=>{
            setUserNavPanel(false)
        }, 300)
    }
    const handleChange = (e) =>{
        let query = e.target.value;
        if(e.keyCode === 13 && query.length){
            navigate(`/search/${query}`)
        }
    }
    // console.log(userAuth)

    useEffect(() => {
        if(access_token){
            axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/new-notification', {
                headers:{
                    'Authorization': `Bearer ${access_token}` 
                }
            } )
            .then(({data}) => {
                setUserAuth({...userAuth, ...data})
            })
            .catch(err => {
                console.log(err);
            })
        }
    }, [access_token]);
    

    const changeChage = () => {
        let newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        document.body.setAttribute('data-theme', newTheme)
        storeInSession('theme', newTheme)
    
    }

    const handleSignInClick = () => {
        setActiveButton('signin');
    };

    const handleSignUpClick = () => {
        setActiveButton('signup');
    };

    const handlePostLinkClick = (e) => {
        if (!access_token) {
            e.preventDefault();
            toast.error("Please sign in to continue.");
        }
    };

    return (
        <>
            <nav className={`navbar z-50 bg-white shadow-xl ${theme === 'dark' ? 'shadow-grey-900' : 'purple/30'}`}>
                <Link to='/'>
                    <img src={theme == 'light' ? darkLogo : lightLogo} alt="logo" className='flex-none w-14' />
                </Link>
               
                {/* <div className={" absolute bg-white w-full left-0 top-full mt-0.5 border-t border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " + (searchBoxVisibility ? "show" : "hide")}> */}
                <div className={
                    `absolute  w-full left-0 top-full mt-0.5 py-4 px-[5vw] md:border-purple md:block md:relative md:inset-0 md:p-0 md:w-auto md:show ${
                    searchBoxVisibility ? "block" : "hidden"} ${
                    theme === 'dark' ? 'focus:outline-purple/30' : 'focus:outline-purple'}`
                }>
                    <input type="text" placeholder='Search' className={'w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-black md:pl-12 ' + (theme == 'light' ? 'focus:outline-sky-800' : 'focus:outline-purple')} onKeyDown={handleChange}/>
                    <i className={"fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-black "}></i>

                </div>
                <div className='flex items-center gap-3 md:gap-6 ml-auto '>
                    <button className='md:hidden  bg-grey-500 w-12 h-12 rounded-full flex items-center justify-center' onClick={()=> setSearchBoxVisibility(currentVal => !currentVal)}><i className='fi fi-rr-search text-xl'></i></button>

                    <Link to='/editor' className='hidden md:flex gap-2 link text-hover:black ' onClick={handlePostLinkClick}>
                        <p>post</p>
                        <i className='fi fi-rr-file-edit'></i>
                    </Link>

                    <button className='w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 '>
                        <i className={'fi fi-rr-' + (theme == 'light' ? 'moon-stars' : 'sun') + " text-2xl block mt-1"} onClick={changeChage}></i>
                    </button>
                    {
                        access_token ? 
                        <>
                            {/* <Link to='/dashboard/notifications'>
                                <button className='w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 '>
                                    <i className='fi fi-rr-bell text2xl block mt-1'></i>
                                    {
                                        new_notification_available && 
                                        <span className='bg-red w-3 h-3 rounded-full  absolute z-10 top-2 right-2'></span>
                                    }
                                </button>
    
                            </Link> */}
                            <Link to='/dashboard/notifications'>
                                <button className='w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 flex items-center justify-center'>
                                    <i className={`fi fi-rr-bell text-2xl block mt-1 ${new_notification_available ? 'bg-clip-text text-transparent bg-bell-highlight' : ''}`} />
                                    {
                                    new_notification_available && 
                                    <span className='bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2'></span>
                                    }
                                </button>
                                </Link>
                            <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
                                <button className="w-12 h-12 mt1">
                                    <img src={profile_img} alt="Profile" className='w-full h-full object-cover rounded-full' />
                                </button>
                                {
                                    userNavPanel &&
                                    <UserNavigationPanel/>
                                }
                            </div>

                        </>
                        : 
                        <>
                         <div className="flex space-x-2">
                        <Link
                            className={`px-4 py-2 rounded-full ${activeButton === 'signin' ? 'bg-black text-white' : 'bg-gray-300 text-black'}`}
                            to='/signin'
                            onClick={handleSignInClick}
                        >
                            Sign In
                        </Link>
                        <Link
                            className={`px-4 py-2 rounded-full hidden md:block ${activeButton === 'signup' ? 'bg-black text-white' : 'bg-gray-300 text-black'}`}
                            to='/signup'
                            onClick={handleSignUpClick}
                        >
                            Sign Up
                        </Link>
                    </div>
                        </>
                    }
                    

                </div>
            </nav>
            <Outlet/>
        </>
    )
}
export default Navbar;