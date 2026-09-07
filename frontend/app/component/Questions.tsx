import React from 'react'

const Questions = ({ question, onClick }: { question: string; onClick: () => void }) => {
  return (
    <button type="button" onClick={onClick} className='flex gap-2 items-center text-left hover:underline'>
        <div className='bg-black w-2 h-2 rounded-full'>
            </div><p>{question}</p>
    </button>
  )
}

export default Questions
