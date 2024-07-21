import React, { useState } from 'react'
import { ethers } from 'ethers'
import { createLightAccountAlchemyClient, createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { Token } from '@uniswap/sdk-core'
import { useAuthContext } from './AuthContext';
 
const chain = sepolia;

const MainContext = React.createContext()

export const provider = new ethers.providers.Web3Provider(window.ethereum)

export const MainProvider = ({ children }) => {

    const { WETH_ADDRESS, USDC_ADDRESS, DAI_ADDRESS } = useAuthContext()
    
    const WETH_TOKEN = new Token(
        1,
        WETH_ADDRESS,
        18,
        'WETH',
        'Wrapped Ether'
    )
      
    const USDC_TOKEN = new Token(
        1,
        USDC_ADDRESS,
        6,
        'USDC',
        'USD//C'
    )

    const DAI_TOKEN = new Token(
        1,
        DAI_ADDRESS,
        18,
        'DAI',
        'Dai Stablecoin'
    )
    
    return (
        <MainContext.Provider value={{
            DAI_TOKEN,
            USDC_TOKEN,
            WETH_TOKEN
        }}>
        {children}
        </MainContext.Provider>
    )
}

export const useMainContext = () => React.useContext(MainContext)