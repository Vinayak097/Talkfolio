"use client"
import Searchbar from "./component/Searchbar";
import Navbar from "./component/Navbar";
import { useState } from "react";
import Questions from "./component/Questions";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = [
  "Tell me about Vinay",
  "What are his best projects?",
  "What is his tech stack?",
  "Tell me about his experience",
];
export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  

  const askQuestion = async (prompt: string) => {
    if (loading) return;
    const history = messages;
    setMessages((current) => [...current, { role: "user", content: prompt }, { role: "assistant", content: "" }]);
    setLoading(true);

    try {
      const response = await fetch( "http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, history }),
      });
      if (!response.ok || !response.body) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || "The chat server could not respond.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const event of events) {
          if (!event.startsWith("data: ")) continue;
          const data = JSON.parse(event.slice(6));
          if (data.error) throw new Error(data.error);
          if (data.text) {
            setMessages((current) => {
              const next = [...current];
              next[next.length - 1] = { ...next[next.length - 1], content: next[next.length - 1].content + data.text };
              return next;
            });
          }
        }
        if (done) break;
      }
    } catch (error) {
      setMessages((current) => {
        const next = [...current];
        next[next.length - 1] = { ...next[next.length - 1], content: error instanceof Error ? error.message : "Something went wrong." };
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen">
      <Navbar></Navbar>

      <div className={`relative h-[calc(100vh-64px)] overflow-y-auto bg-amber-100 px-4 pb-32 pt-8 ${messages.length === 0 ? "flex items-center" : ""} justify-center`}>
          {messages.length === 0 ? (
            <div className="flex flex-col gap-2">
              <h2>Try asking questions</h2>
              {suggestions.map((sug,index)=>(
                <Questions key={index} question={sug} onClick={() => askQuestion(sug)}></Questions>
              ))}
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
              {messages.map((message, index) => (
                <div key={index} className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "user" ? "self-end bg-black text-white" : "self-start bg-white"}`}>
                  {message.content || (loading && message.role === "assistant" ? "Thinking..." : "")}
                </div>
              ))}
            </div>
          )}
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex justify-center p-2">
        <Searchbar onSubmit={askQuestion} disabled={loading}></Searchbar>
      </div>
    </div>
  );
}
