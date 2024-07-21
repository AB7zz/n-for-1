import React from 'react'

const Card = () => {
    const [inputs, setInputs] = React.useState([
        { id: 1, value: '' },
    ]);

    const handleAddInput = () => {
        setInputs([...inputs, { id: inputs.length + 1, value: '' }]);
    };

    const handleChange = (event, index) => {
        const newInputs = [...inputs];
        newInputs[index].value = event.target.value;
        setInputs(newInputs);
    };
  return (
    <div className='m-auto bg-gray-200 rounded-[20px] px-10 py-10'>
        <h1 className='text-pink-500 text-center text-3xl mb-10 font-semibold'>Swap</h1>
        {inputs.map((input, index) => (
            <div key={input.id} className='grid grid-cols-3 gap-5'>
                <input 
                    value={input.value}
                    onChange={(event) => handleChange(event, index)} 
                    type="number" 
                    placeholder="0.1" 
                    name="" 
                    className='text-2xl col-span-2 w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' id="" 
                />
                <select name="" className='w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' id=""></select>
            </div>
        ))}
        <div className='flex justify-center'>
            <div className='m-auto cursor-pointer hover:bg-pink-800 bg-pink-500 px-7 py-2 rounded' onClick={handleAddInput}>
            <p className='text-white text-2xl text-center'>+</p>
            </div>
        </div>
        <div className='grid grid-cols-3 gap-5'>
            <input type="number" placeholder="0.1" name="" className='text-2xl col-span-2 w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' id="" />
            <select name="" className='w-full rounded-[12px] pl-3 py-3 my-5 focus:outline-none' id=""></select>
        </div>
        <div className='flex justify-center'>
            <button className='bg-black hover:bg-zinc-900 mt-10 text-white text-2xl rounded-[12px] px-7 py-2'>Swap</button>
        </div>
    </div>
  )
}

export default Card