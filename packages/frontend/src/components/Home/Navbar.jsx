import React from 'react'
import { useAuthContext } from '../../context/AuthContext';

const Navbar = () => {
    
    const {account, isConnected, connectToMetaMask, checkMetaMask} = useAuthContext();

    React.useEffect(() => {
        checkMetaMask();
    }, []);
    return (
        <nav className="fixed w-full bg-gray-200 shadow shadow-gray-300 w-100 px-8 md:px-auto">
            <div className="md:h-16 h-28 mx-auto md:px-4 container flex items-center justify-between flex-wrap md:flex-nowrap">
            
                <div className="text-pink-500 md:order-1">
                    
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                </div>
                <div className="order-2 md:order-3">
                    <button
                        className={`px-4 py-2 bg-pink-500 hover:bg-pink-600 text-gray-50 rounded-xl flex items-center gap-2 ${isConnected ? 'cursor-not-allowed opacity-50' : ''}`}
                        onClick={isConnected ? () => {} : connectToMetaMask} // Disable button on connect
                        disabled={isConnected} // Alternatively, use disabled prop
                    >
                        <span>{isConnected ? `${account.slice(0, 10)}...` : 'Connect'}</span>
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar