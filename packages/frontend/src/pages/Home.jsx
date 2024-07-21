import React from 'react'
import Navbar from '../components/Home/Navbar'
import Card from '../components/Home/Card'

const Home = () => {
  return (
    <div className='h-screen'>
      <Navbar />
      <div className='h-full flex justify-center'>
        <Card />
      </div>
    </div>
  )
}

export default Home