import { hardhat } from "wagmi/chains";
import { CurrencyDollarIcon, HeartIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import Image from "next/image";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrencyPrice);

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex space-x-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div className="btn btn-primary btn-sm font-normal cursor-auto gap-0">
                <CurrencyDollarIcon className="h-4 w-4 mr-0.5" />
                <span>{nativeCurrencyPrice}</span>
              </div>
            )}
            {getTargetNetwork().id === hardhat.id && <Faucet />}
          </div>
          <SwitchTheme className="pointer-events-auto" />
        </div>
      </div>
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            <div className="text-center">
              {/*TODO: replace URL with the URL repo*/}
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Fork me
              </a>
            </div>
            <span>·</span>
            <div className="flex justify-center items-center gap-2">
              <p className="m-0 text-center">
                Built with <HeartIcon className="inline-block h-4 w-4" /> using
              </p>
              <a
                className="flex justify-center items-center gap-1"
                href="https://buidlguidl.com/"
                target="_blank"
                rel="noreferrer"
              >
                <div className="relative w-5 h-5 flex justify-center items-center">
                  <Image alt="SE2 logo" className={`cursor-pointer w-3 h-5`} fill src="/logos/buildGuild.svg" />
                </div>
                <span className="underline underline-offset-2">BuidlGuidl</span>
              </a>

              <span> - </span>

              <a
                className="flex justify-center items-center gap-1"
                href="https://waku.org/"
                target="_blank"
                rel="noreferrer"
              >
                <div className="relative w-5 h-5 flex justify-center items-center">
                  <Image alt="SE2 logo" className={`cursor-pointer w-3 h-5`} fill src="/logos/waku.svg" />
                </div>
                <span className="underline underline-offset-2">Waku</span>
              </a>

              <span> - </span>

              <a
                className="flex justify-center items-center gap-1"
                href="https://peanut.to/"
                target="_blank"
                rel="noreferrer"
              >
                <div className="relative w-5 h-5 flex justify-center items-center">
                  <Image alt="SE2 logo" className={`cursor-pointer w-3 h-5`} fill src="/logos/peanut.svg" />
                </div>
                <span className="underline underline-offset-2">Peanut protocol</span>
              </a>


            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
