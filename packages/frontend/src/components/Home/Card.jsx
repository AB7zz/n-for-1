import React from 'react'
import { useAuthContext } from '../../context/AuthContext';

const Card = () => {
    const { balances, DAI_ADDRESS, USDC_ADDRESS, WETH_ADDRESS } = useAuthContext()

    const [selectedTokens, setSelectedTokens] = React.useState([
        { id: 1, value: DAI_ADDRESS },
    ]);

    const [inputs, setInputs] = React.useState([
        { id: 1, value: '' },
    ]);

    const handleAddInput = () => {
        setInputs([...inputs, { id: inputs.length + 1, value: '' }]);
        setSelectedTokens([...selectedTokens, { id: selectedTokens.length + 1, value: DAI_ADDRESS }]);
    };

    const handleChange = (event, index) => {
        const newInputs = [...inputs];
        newInputs[index].value = event.target.value;
        setInputs(newInputs);
    };

    const handleSelectTokenChange = (event, index) => {
        const newInputs = [...selectedTokens];
        newInputs[index].value = event.target.value;
        setSelectedTokens(newInputs);
    };

    const displayBalance = (index) => {
        if (selectedTokens[index].value === DAI_ADDRESS) return balances.DAI;
        if (selectedTokens[index].value === USDC_ADDRESS) return balances.USDC;
        if (selectedTokens[index].value === WETH_ADDRESS) return balances.WETH;
        return '0';
    };

    return (
        <div className='m-auto bg-gray-200 rounded-[20px] px-10 py-10'>
            <h1 className='text-pink-500 text-center text-3xl mb-10 font-semibold'>Swap</h1>
            {inputs.map((input, index) => (
                <div key={input.id} className='items-center grid grid-cols-7 gap-5'>
                    <input 
                        value={input.value}
                        onChange={(event) => handleChange(event, index)} 
                        type="number" 
                        placeholder="0.1" 
                        name="" 
                        className='text-2xl col-span-3 w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' id="" 
                    />
                    <select value={selectedTokens[index].value} onChange={(event) => handleSelectTokenChange(event, index)} name="" className='col-span-2 text-2xl text-zinc-800 w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' id="">
                        <option value="0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357">DAI</option>
                        <option value="0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8">USDC</option>
                    </select>
                    <div className='col-span-2'>
                        <p className='text-2xl'>Bal = <span className='text-pink-500'>{displayBalance(index) - input.value}</span></p>
                    </div>
                </div>
            ))}
            <div className='flex justify-center'>
                <div className='m-auto cursor-pointer hover:bg-pink-800 bg-pink-500 px-7 py-2 rounded' onClick={handleAddInput}>
                <p className='text-white text-2xl text-center'>+</p>
                </div>
            </div>
            <div className='items-center grid grid-cols-7 gap-5'>
                <input type="number" placeholder="0.1" name="" className='text-2xl col-span-3 w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' id="" />
                <select name="" className='col-span-2 text-2xl text-zinc-800 w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' id="">
                    <option value="0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9" selected>WETH</option>
                </select>
                <div className='col-span-2'>
                    <p className='text-2xl'>Bal = <span className='text-pink-500'>{balances.WETH}</span></p>
                </div>
            </div>
            <div className='flex justify-center'>
                <button className='bg-black hover:bg-zinc-900 mt-10 text-white text-2xl rounded-[12px] px-7 py-2'>Swap</button>
            </div>
        </div>
    )
}

export default Card