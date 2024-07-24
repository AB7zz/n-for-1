import React, { useState } from 'react'
import { ethers } from 'ethers'
import { createLightAccountAlchemyClient, createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { useAuthContext } from './AuthContext';
import { ChainId, Token, WETH9, CurrencyAmount } from '@uniswap/sdk-core'
import { Pair, Route } from '@uniswap/v2-sdk'
// import { uniswapV2poolABI } from '../constants/abi';
import uniswapV2poolABI from '../constants/uniswapV2pool.json'
 
const chain = sepolia;

const MainContext = React.createContext()

export const provider = new ethers.providers.Web3Provider(window.ethereum)

export const MainProvider = ({ children }) => {

    const { WETH_ADDRESS, USDC_ADDRESS, DAI_ADDRESS } = useAuthContext()
    
    const WETH_TOKEN = new Token(
        ChainId.SEPOLIA,
        WETH_ADDRESS,
        18,
        'WETH',
        'Wrapped Ether'
    )
      
    const USDC_TOKEN = new Token(
        ChainId.SEPOLIA,
        USDC_ADDRESS,
        6,
        'USDC',
        'USD//C'
    )

    const DAI_TOKEN = new Token(
        ChainId.SEPOLIA,
        DAI_ADDRESS,
        18,
        'DAI',
        'Dai Stablecoin'
    )

    async function createPair(TOKEN1, TOKEN2) {
        const pairAddress = Pair.getAddress(DAI_TOKEN, WETH_TOKEN)
        console.log(pairAddress)
      
        const pairContract = new ethers.Contract(pairAddress, uniswapV2poolABI, provider)
        const reserves = await pairContract["getReserves"]()
        const [reserve0, reserve1] = reserves
      
        const tokens = [DAI_TOKEN, WETH_TOKEN]
        const [token0, token1] = tokens[0].sortsBefore(tokens[1]) ? tokens : [tokens[1], tokens[0]]
      
        const pair = new Pair(CurrencyAmount.fromRawAmount(token0, reserve0), CurrencyAmount.fromRawAmount(token1, reserve1))
        return pair
    }

    const getPrice = async (TOKEN1, TOKEN2) => {
        
        const pair = await createPair(DAI_TOKEN, WETH_TOKEN)

        const route = new Route([pair], WETH_TOKEN, DAI_TOKEN)

        console.log(route.midPrice.toSignificant(6))
        console.log(route.midPrice.invert().toSignificant(6))
    }
    
    return (
        <MainContext.Provider value={{
            DAI_TOKEN,
            USDC_TOKEN,
            WETH_TOKEN,
            getPrice
        }}>
        {children}
        </MainContext.Provider>
    )
}

export const useMainContext = () => React.useContext(MainContext)