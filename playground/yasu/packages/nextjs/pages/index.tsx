import Link from "next/link";
import type { NextPage } from "next";
import { ChatBubbleLeftIcon, FaceSmileIcon, WalletIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import axios from "axios";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">PrivateMafiaGame</span>
          </h1>
          <p className="text-center text-lg">
            Building a Web3 mini game inspired by {" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              the Mafia game
            </code> {" "}
          </p>
          <p>and using multiple technologies such as ...</p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <WalletIcon className="h-8 w-8 fill-secondary" />
              <p>
                1. Connect your wallet{" "}
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <ChatBubbleLeftIcon className="h-8 w-8 fill-secondary" />
              <p>
                2. Go to {" "}
                <Link href="/mafia-game" passHref className="link">
                  Mafia GAME
                </Link>{" "}
                tab
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <FaceSmileIcon className="h-8 w-8 fill-secondary" />
              <p>
                3. Enjoy the game !
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
