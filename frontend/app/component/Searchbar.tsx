import { Input } from '@base-ui/react'
import React from 'react'
import { IoMdSend } from 'react-icons/io'

const Searchbar = () => {
  return (
    <div>
      <div className='flex h-max-94 overflow-auto justify-between gap-4 p-2 border border-gray-500 px-4 w-lg  rounded-full'>
      <Input className='p-2 w-full h-max-94 overflow-auto focus:outline-none  ' type='text' placeholder='give me a prompt '></Input>
      <button>
        <IoMdSend className='text-black'></IoMdSend>
      </button>
    </div>
      
    </div>
  )
}

export default Searchbar
