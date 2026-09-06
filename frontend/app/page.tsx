import Image from "next/image";
import Searchbar from "./component/Searchbar";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div>
        <Searchbar></Searchbar>
      </div>
    </div>
  );
}
