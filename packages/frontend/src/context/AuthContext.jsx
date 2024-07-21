import React, { useState } from 'react'
import { ethers } from 'ethers'
import { createLightAccountAlchemyClient, createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
// import type { Hex } from "viem";
 
const chain = sepolia;

const AuthContext = React.createContext()

export const provider = new ethers.providers.Web3Provider(window.ethereum)

export const AuthProvider = ({ children }) => {
    const [isConnected, setIsConnected] = React.useState(false);
    const [account, setAccount] = React.useState(null);
    const [smartProvider, setSmartProvider] = React.useState(null)
    const [balances, setBalances] = useState({ DAI: '0', USDC: '0', WETH: '0' });

    const DAI_ADDRESS = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357";
    const USDC_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
    const WETH_ADDRESS = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

    

    const connectToMetaMask = async () => {
        try {
        if (typeof window.ethereum !== 'undefined') {
            // const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            await provider.send("eth_requestAccounts", []).then(async () => {
                const newAccount = provider.getSigner()
                const address = await newAccount.getAddress();
                setAccount(address)
                setIsConnected(true);
                const _smartProvider = await getSmartAccount();
                setSmartProvider(_smartProvider)

                fetchBalances(signer)
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
                const _smartProvider = await getSmartAccount(signer);
                setSmartProvider(_smartProvider)

                fetchBalances(signer)
            });
        }
    };

    const fetchBalances = async (signer) => {
        const userAddress = await signer.getAddress();

        // Define token contracts
        const tokenAddresses = {
            DAI: DAI_ADDRESS,
            USDC: USDC_ADDRESS,
            WETH: WETH_ADDRESS
        };

        const tokenContracts = {
            DAI: new ethers.Contract(
                DAI_ADDRESS,
                [
                    "function balanceOf(address owner) view returns (uint256)",
                    "function decimals() view returns (uint8)"
                ],
                provider
            ),
            USDC: new ethers.Contract(
                USDC_ADDRESS,
                [
                    "function balanceOf(address owner) view returns (uint256)",
                    "function decimals() view returns (uint8)"
                ],
                provider
            ),
            WETH: new ethers.Contract(
                WETH_ADDRESS,
                [
                    "function balanceOf(address owner) view returns (uint256)",
                    "function decimals() view returns (uint8)"
                ],
                provider
            )
        };

        // Fetch balances
        const fetchBalance = async (token) => {
            const contract = tokenContracts[token];
            const balance = await contract.balanceOf(userAddress);
            const decimals = await contract.decimals();
            return ethers.utils.formatUnits(balance, decimals);
        };

        const [DAI, USDC, WETH] = await Promise.all([
            fetchBalance('DAI'),
            fetchBalance('USDC'),
            fetchBalance('WETH')
        ]);

        setBalances({ DAI, USDC, WETH });
    };
    

    const getSmartAccount = async (signer) => {

        const smartAccountClient = await createModularAccountAlchemyClient({
            apiKey: import.meta.env.VITE_ALCHEMY_API,
            chain,
            signer,
            gasManagerConfig: {
              policyId: import.meta.env.VITE_ALCHEMY_GAS_POLICY_ID,
            },
        });
        
        console.log(smartAccountClient.getAddress());

        return smartAccountClient
    }
    
    return (
        <AuthContext.Provider value={{ 
            connectToMetaMask,
            checkMetaMask,
            getSmartAccount,
            USDC_ADDRESS,
            DAI_ADDRESS,
            WETH_ADDRESS,
            balances,
            account,
            isConnected,
            smartProvider
        }}>
        {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => React.useContext(AuthContext)