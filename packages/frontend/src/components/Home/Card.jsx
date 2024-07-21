import React from 'react'
import { useAuthContext } from '../../context/AuthContext';
import { NSwap } from '../../constants/addresses';
import { NSwapABI, ERC20ABI } from '../../constants/abi';
import { provider } from '../../context/AuthContext';
import { ethers } from 'ethers';
import { encodeFunctionData } from 'viem'

const signer = provider.getSigner()

const NSwapContract = new ethers.Contract(NSwap, NSwapABI, signer);

const Card = () => {
    const { balances, DAI_ADDRESS, USDC_ADDRESS, WETH_ADDRESS, account, getSmartAccount } = useAuthContext()

    const [selectedTokens, setSelectedTokens] = React.useState([DAI_ADDRESS]);
    const [inputs, setInputs] = React.useState(['']);

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
        // const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer);
        // const tx = await tokenContract.approve(NSwap, amount);
        // await tx.wait();
        // console.log(`Approved ${amount} of ${tokenAddress}`);

        const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer);
        const data = tokenContract.interface.encodeFunctionData('approve', [NSwap, amount]);
        console.log(data)
        const userOperation = {
            target: tokenAddress,
            data: data,
            value: 0n
        };

        const { hash } = await smartAccountClient.sendUserOperation(userOperation);
        console.log(`Approved ${amount} of ${tokenAddress}. Transaction hash: ${hash}`);
    };

    const getDecimal = (tokenAddress) => {
        if (tokenAddress === DAI_ADDRESS) return 18;
        if (tokenAddress === USDC_ADDRESS) return 6;
        if (tokenAddress === WETH_ADDRESS) return 18;
        return 18;
    };

    const handleSwap = async() => {
        console.log(inputs);
        console.log(selectedTokens);
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

            const gasPrice = await provider.getGasPrice();
            const maxPriorityFeePerGas = ethers.utils.parseUnits('2', 'gwei');
            const maxFeePerGas = gasPrice.add(maxPriorityFeePerGas);

            const txOptions = {
                gasLimit: 100000
            };

            const _amounts = inputs.map((input, i) => (parseInt(input) * 10**getDecimal(selectedTokens[i])).toString()); 

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
            <h1 className='text-pink-500 text-center text-3xl mb-10 font-semibold'>Swap</h1>
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
