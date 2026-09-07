"use client"
import Searchbar from "./component/Searchbar";
import Navbar from "./component/Navbar";
import { useState } from "react";
import Questions from "./component/Questions";
const suggestions = [
  "Tell me about Vinay",
  "What are his best projects?",
  "What is his tech stack?",
  "Tell me about his experience",
];
export default function Home() {
  const [started,setStarted] =useState(true)
  return (
    <div className="">
      <Navbar></Navbar>

      <div className={`h-120 bg-amber-100 flex ${started && "items-center"} justify-center`}>
          {started &&(
            <div className="flex flex-col gap-2">
              <h2>Try asking quetsions</h2>
              {suggestions.map((sug,index)=>(
                <Questions key={index} question={sug}></Questions>
              ))}
            </div>
          )}
      </div>
      <div className="flex justify-center p-2">
        <Searchbar></Searchbar>
      </div>
    </div>
  );
}
