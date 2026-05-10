import React from 'react'

const Login = () => {
  return (
    <div className='flex justify-center items-center h-screen w-full'>

      <div className='shadow-[0px_0px_50px_-15px_rgba(119,73,248,1)] w-100 h-fit rounded-2xl p-8 border-[#7749f8] border-2'>
        <h1 className='text-2xl font-bold my-5 mb-10'>Login</h1>
        <form className='flex justify-center flex-col gap-5'>

          <input type="text" placeholder='Email' className='border-[#7749f8] border-2 rounded-lg w-full p-1.5 px-3 outline-[#7749f8]' />
          <input type="password" placeholder='Password' className='border-[#7749f8] border-2 rounded-lg w-full p-1.5 px-3 outline-[#7749f8]' />
          <div className='flex justify-around mt-10'>
            <button className='cursor-pointer w-36 text-black p-2 rounded-lg hover:bg-[#7849f8] hover:text-white  font-semibold'>SignUp</button>
            <button className='cursor-pointer w-36 text-white p-2 rounded-lg hover:bg-[#ffffff] hover:text-black bg-[#7749f8] font-semibold'>Login</button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default Login