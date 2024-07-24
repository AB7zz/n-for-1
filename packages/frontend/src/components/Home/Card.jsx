import React from 'react'
import { useAuthContext } from '../../context/AuthContext';
import { NSwap, SwapRouter } from '../../constants/addresses';
import { NSwapABI, ERC20ABI } from '../../constants/abi';
import { provider } from '../../context/AuthContext';
import { ethers } from 'ethers';
import { encodeFunctionData } from 'viem'
import { useMainContext } from '../../context/MainContext';

const signer = provider.getSigner()

const NSwapContract = new ethers.Contract(NSwap, NSwapABI, signer);

const Card = () => {
    const { balances, DAI_ADDRESS, USDC_ADDRESS, WETH_ADDRESS, account, getSmartAccount } = useAuthContext()

    const { getPrice } = useMainContext()

    const [selectedTokens, setSelectedTokens] = React.useState([DAI_ADDRESS]);
    const [showSettings, setShowSettings] = React.useState(false);
    const [inputs, setInputs] = React.useState(['']);
    const [deadline, setDeadline] = React.useState(0)

    const [showSlippageTooltip, setShowSlippageTooltip] = React.useState(false);
    const [showDeadlineTooltip, setShowDeadlineTooltip] = React.useState(false);

    const handleAddInput = () => {
        setInputs([...inputs, '']);
        setSelectedTokens([...selectedTokens, DAI_ADDRESS]);
    };

    const handleChange = (event, index) => {
        const newInputs = [...inputs];
        newInputs[index] = event.target.value;
        setInputs(newInputs);
    };

    const handleSelectTokenChange = (event, index) => {
        const newSelectedTokens = [...selectedTokens];
        newSelectedTokens[index] = event.target.value;
        setSelectedTokens(newSelectedTokens);
    };

    const displayBalance = (index) => {
        if (selectedTokens[index] === DAI_ADDRESS) return balances.DAI;
        if (selectedTokens[index] === USDC_ADDRESS) return balances.USDC;
        if (selectedTokens[index] === WETH_ADDRESS) return balances.WETH;
        return '0';
    };

    const approveToken = async (smartAccountClient, tokenAddress, amount) => {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer);
        const tx = await tokenContract.approve(SwapRouter, amount);
        await tx.wait();
        console.log(`Approved ${amount} of ${tokenAddress}`);

        // const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer);
        // const data = tokenContract.interface.encodeFunctionData('approve', [NSwap, amount]);
        // console.log(data)
        // const userOperation = {
        //     target: tokenAddress,
        //     data: data,
        //     value: 0n
        // };

        // const { hash } = await smartAccountClient.sendUserOperation(userOperation);
        // console.log(`Approved ${amount} of ${tokenAddress}. Transaction hash: ${hash}`);
    };

    const getDecimal = (tokenAddress) => {
        if (tokenAddress === DAI_ADDRESS) return 18;
        if (tokenAddress === USDC_ADDRESS) return 6;
        if (tokenAddress === WETH_ADDRESS) return 18;
        return 18;
    };

    const handleSwap = async() => {
        try {
            const amounts = inputs.map((input, i) => ethers.utils.parseUnits(input, getDecimal(selectedTokens[i])));
            const tokens = selectedTokens;

            const smartAccountClient = await getSmartAccount(signer)
            
            for (let i = 0; i < tokens.length; i++) {
                await approveToken(smartAccountClient, tokens[i], amounts[i]);
            }

            // const smartAccountClient = await getSmartAccount(signer)

            // const swapData = encodeFunctionData({
            //     abi: NSwapABI,
            //     functionName: 'swapMultipleTokensForWETH',
            //     args: [tokens, amounts],
            // })

            // console.log(swapData, NSwap, NSwapABI, smartAccountClient)

            // const { hash } = await smartAccountClient.sendUserOperation({
            //     target: "0x36f1d5151C904b0BE6d64A61c2702ECbAeD7FA71",
            //     data: swapData,
            //     value: 0n,
            // });

            // console.log('Swap successful:', hash);

            

            const _amounts = inputs.map((input, i) => (parseInt(input) * 10**getDecimal(selectedTokens[i])).toString()); 

            // const gasEstimate = await NSwapContract.estimateGas.swapMultipleTokensForWETH(tokens, _amounts);
            const gasPrice = await provider.getGasPrice();
            const maxPriorityFeePerGas = ethers.utils.parseUnits('2', 'gwei');
            const maxFeePerGas = gasPrice.add(maxPriorityFeePerGas);
            const txOptions = {
                gasLimit: 100000,
                maxPriorityFeePerGas,
                maxFeePerGas
            };
            
            // console.log(gasEstimate, gasPrice, maxPriorityFeePerGas, maxFeePerGas)
            console.log(tokens)
            console.log(amounts)
            console.log(_amounts)

            const tx = await NSwapContract.swapMultipleTokensForWETH(tokens, _amounts, txOptions);
            await tx.wait();

            
        } catch (error) {
            console.error('Error swapping tokens:', error);
        }
    }

    return (
        <div className='m-auto bg-gray-200 rounded-[20px] px-10 py-10'>
            <div className='flex justify-between'>
                <h1 className='text-pink-500 text-3xl mb-10 font-semibold'>Swap</h1>
                {
                showSettings ? 
                    <i onClick={() => setShowSettings(false)} class="cursor-pointer fa-solid fa-times"></i> 
                :
                    <i onClick={() => setShowSettings(true)} class="cursor-pointer fa-solid fa-gear"></i>
                }
            </div>
            {showSettings && (
                <div className='grid grid-cols-2 gap-5'>
                <div className='relative'>
                {showSlippageTooltip && (
                      <div className='absolute top-[-100px] left-0 mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-md shadow-lg'>
                        The maximum percentage of price movement you are willing to tolerate for a trade.
                      </div>
                    )}
                  <p className='text-2xl flex items-center'>
                    Slippage Tolerance
                    <span
                      className='ml-2 cursor-pointer'
                      onMouseEnter={() => setShowSlippageTooltip(true)}
                      onMouseLeave={() => setShowSlippageTooltip(false)}
                    >
                      ℹ️
                    </span>
                    
                  </p>
                  <input type="number" placeholder="%" className='text-2xl w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' />
                </div>
                <div className='relative'>
                {showDeadlineTooltip && (
                    <div className='absolute top-[-100px] left-0 mt-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-md shadow-lg'>
                    The time limit in minutes for the trade to be completed before it is canceled.
                    </div>
                )}
                  <p className='text-2xl flex items-center'>
                    Deadline
                    <span
                      className='ml-2 cursor-pointer'
                      onMouseEnter={() => setShowDeadlineTooltip(true)}
                      onMouseLeave={() => setShowDeadlineTooltip(false)}
                    >
                      ℹ️
                    </span>
                    
                  </p>
                  <input onChange={e => setDeadline(e.target.value)} type="number" placeholder="in minutes" className='text-2xl w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' />
                </div>
              </div>
            )}
            {inputs.map((input, index) => (
                <div key={index} className='items-center grid grid-cols-7 gap-5'>
                    <input 
                        value={input}
                        onChange={(event) => handleChange(event, index)} 
                        type="number" 
                        placeholder="0.1" 
                        className='text-2xl col-span-3 w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' 
                    />
                    <select 
                        value={selectedTokens[index]} 
                        onChange={(event) => handleSelectTokenChange(event, index)} 
                        className='col-span-2 text-2xl text-zinc-800 w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none'
                    >
                        <option value={DAI_ADDRESS}>DAI</option>
                        <option value={USDC_ADDRESS}>USDC</option>
                    </select>
                    <div className='col-span-2'>
                        <p className='text-2xl'>Bal = <span className='text-pink-500'>{displayBalance(index) - input}</span></p>
                    </div>
                </div>
            ))}
            <div className='flex justify-center'>
                <div className='m-auto cursor-pointer hover:bg-pink-800 bg-pink-500 px-7 py-2 rounded' onClick={handleAddInput}>
                    <p className='text-white text-2xl text-center'>+</p>
                </div>
            </div>
            <div className='items-center grid grid-cols-7 gap-5'>
                <input 
                    type="number" 
                    placeholder="0.1" 
                    className='text-2xl col-span-3 w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' 
                />
                <select 
                    className='col-span-2 text-2xl text-zinc-800 w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none'
                >
                    <option value={WETH_ADDRESS} selected>WETH</option>
                </select>
                <div className='col-span-2'>
                    <p className='text-2xl'>Bal = <span className='text-pink-500'>{balances.WETH}</span></p>
                </div>
            </div>
            <div onClick={handleSwap} className='flex justify-center'>
                <button className='bg-black hover:bg-zinc-900 mt-10 text-white text-2xl rounded-[12px] px-7 py-2'>Swap</button>
            </div>
        </div>
    )
}

export default Card
