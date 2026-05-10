import React from 'react'

const Navbar = () => {
  return (
    <nav className='bg-[#7749F8] text-white text-2xl font-bold flex justify-between items-center h-16 fixed w-full'>
        <div className='mx-10'>Personal Blogging App</div>
        <div className='mx-10 flex justify-center gap-5'>
          <button>Login</button>
          <button>Signup</button>

        </div>
    </nav>
  )
}

export default Navbar