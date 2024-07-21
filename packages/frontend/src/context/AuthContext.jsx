import React from 'react'
import { ethers } from 'ethers'
import { createLightAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { LocalAccountSigner, sepolia } from "@alchemy/aa-core";
// import type { Hex } from "viem";
 
const chain = sepolia;

const AuthContext = React.createContext()

export const provider = new ethers.providers.Web3Provider(window.ethereum)

export const AuthProvider = ({ children }) => {
    const [isConnected, setIsConnected] = React.useState(false);
    const [account, setAccount] = React.useState(null);
    const [smartProvider, setSmartProvider] = React.useState(null)

    const connectToMetaMask = async () => {
        try {
        if (typeof window.ethereum !== 'undefined') {
            // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            await provider.send("eth_requestAccounts", []).then(async () => {
                const newAccount = provider.getSigner()
                const address = await newAccount.getAddress();
                setAccount(address)
                setIsConnected(true);
                const _smartProvider = await getSmartProvider();
                setSmartProvider(_smartProvider)
            });
        } else {
            console.log("Please install MetaMask!");
        }
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
        }
    };

    const checkMetaMask = async () => {
        if (typeof window.ethereum !== 'undefined') {
            // const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            await provider.send("eth_requestAccounts", []).then(async () => {
                const signer = provider.getSigner()
                const address = await signer.getAddress();
                setAccount(address)
                setIsConnected(true);
                const _smartProvider = await getSmartProvider(signer);
                setSmartProvider(_smartProvider)
            });
        }
    };

    const getSmartProvider = async (signer) => {
        const provider = await createLightAccountAlchemyClient({
            apiKey: import.meta.env.VITE_ALCHEMY_API,
            chain,
            signer,
            version: "v2.0.0",
        });
        
        console.log(provider.getAddress());

        return provider
    }
    
    return (
        <AuthContext.Provider value={{ 
            connectToMetaMask,
            checkMetaMask,
            account,
            isConnected,
            smartProvider
        }}>
        {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => React.useContext(AuthContext)