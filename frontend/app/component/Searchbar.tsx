import React, { FormEvent, useRef, useState } from "react";
import { IoMdSend } from "react-icons/io";

const Searchbar = ({ onSubmit, disabled = false }: { onSubmit: (prompt: string) => void; disabled?: boolean }) => {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    setPrompt(value);

    const textarea = textareaRef.current;

    if (!textarea) return;

    // Reset height first
    textarea.style.height = "auto";

    // Grow with content, up to 160px
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };
    
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const value = prompt.trim();
    if (!value || disabled) return;
    onSubmit(value);
    setPrompt("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl px-4">
      <div className="flex w-lg bg-amber-200 items-end gap-2 rounded-3xl border border-gray-500 px-4 py-3">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Give me a prompt..."
          disabled={disabled}
          className="
            w-full
            max-h-40
            resize-none
            overflow-y-auto
            bg-transparent
            py-1
            outline-none
          
scrollbar-thin
scrollbar-thumb-gray-900
scrollbar-track-transparent
          "
        />

        <button
          type="submit"
          disabled={disabled || !prompt.trim()}
          aria-label="Send message"
          className="shrink-0 rounded-full p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IoMdSend className="text-xl text-black" />
        </button>
      </div>
    </form>
  );
};

export default Searchbar;