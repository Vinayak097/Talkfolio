import { Input } from '@/components/ui/input'
import React from 'react'
import { IoMdSend } from "react-icons/io";

const Questions = ({question}:{question:String}) => {
  return (
    <div className='flex gap-2 items-center '>
        <div className='bg-black w-2 h-2 rounded-full'>
            </div><p>{question}</p>
        

    </div>
  )
}

export default Questions
