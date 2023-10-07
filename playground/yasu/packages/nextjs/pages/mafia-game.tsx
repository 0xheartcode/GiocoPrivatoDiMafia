import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createDecoder, createEncoder, createRelayNode, DecodedMessage, Protocols, RelayNode, waitForRemotePeer } from "@waku/sdk";
import protobuf from "protobufjs";
import { MetaHeader } from "~~/components/MetaHeader";
import { useAccount } from "wagmi";

const CONTENT_TOPIC = `/giocoPrivatoDiMafia/1/chat/proto`;
const ENCODER = createEncoder({ contentTopic: CONTENT_TOPIC });
const DECODER = createDecoder(CONTENT_TOPIC);

const SIMPLE_CHAT_MESSAGE = new protobuf.Type("SimpleChatMessage")
  .add(new protobuf.Field("timestamp", 1, "uint64")) // TODO: some optimisation may be needed here
  .add(new protobuf.Field("text", 2, "string"))
  .add(new protobuf.Field("username", 3, "string"));

const MafiaGame = () => {
  const { address } = useAccount();

  const [username, setUsername] = useState<string>("");
  const [wakuNode, setWakuNode] = useState<RelayNode | null>(null);
  const [wakuStatus, setWakuStatus] = useState<"Starting" | "Connecting" | "Ready" | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<{ date: Date, username: string, text: string }[]>([]);

  // Retrieve incoming messages
  // TODO: Consider caching this function using "useCallback" (it may enhance performance when retrieving a lot of messages)
  const retrieveIncomingWakuMessage = (wakuMessage: DecodedMessage) => {
    // Decode message

    // @ts-ignore
    const { username, text, timestamp }: { username: string, text: string, timestamp: number } = SIMPLE_CHAT_MESSAGE.decode(wakuMessage.payload);

    const date = new Date(timestamp);

    setMessages(prev => [{ username, text, date }, ...prev]);
  };

  // start waku using relay protocol and enabling some privacy preserving properties (wakuGossipSub)
  // TODO: implement catch to throw sexy toast error
  const startWakuNode = () => {
    setWakuStatus("Starting");
    return createRelayNode({ defaultBootstrap: true }).then(relayNode => {
      setWakuNode(relayNode);
      relayNode.start().then(() => {
        setWakuStatus("Connecting");
        waitForRemotePeer(relayNode, [Protocols.Relay]).then(() => {
          setWakuStatus("Ready");
        });
      });

      return relayNode;
    });
  };

  // On mount: starts waku on relay node + subscribe to topic to retrieve messages of a certain topic
  useEffect(() => {
    if (!address) return;

    setUsername(address as string);
    startWakuNode().then(wakuNode => {
      wakuNode.relay.subscribe(
        DECODER,
        retrieveIncomingWakuMessage
      );
    });
  }, [address]);

  const handleOnChangeMessage = (e: ChangeEvent<HTMLInputElement>) => {
    const message = e.target.value;
    setMessage(message);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission

    const date = new Date();
    const timestamp = date.getTime();

    // Create message
    const blueprint = SIMPLE_CHAT_MESSAGE.create({
      timestamp,
      text: message,
      username
    });

    // Encode message
    const payload = SIMPLE_CHAT_MESSAGE.encode(blueprint).finish();

    // Send waku message over waku relay node
    (wakuNode as RelayNode).relay.send(ENCODER, { payload }).then(() => {
      setMessage("");

      setMessages(prev => [{ date, username: username as string, text: message }, ...prev]);
    });
  };

  return (
    <>
      {/*Meta*/}
      <MetaHeader title="Mafia game" description="Mafia game demo">
      </MetaHeader>
      <form className="z-10 mt-5 p-5" onSubmit={handleSubmit}>
        <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-10 relative">
          <div className="h-[5rem] w-[15rem] bg-base-300 absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg shadow-base-300">
            <div className="flex items-center justify-center space-x-2">
              <p className="my-0 text-sm">Game chat status: {wakuStatus}</p>
            </div>
          </div>
          <div className="p-5 divide-y divide-base-300">
            <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1"><p className="font-medium my-0 break-words">Connected as {username}</p>
              <div className="flex border-2 border-base-300 bg-base-200 rounded-full text-accent ">
                <input
                  className="input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] px-4 border w-full font-medium placeholder:text-accent/50 text-gray-400"
                  placeholder="Your message ..." autoComplete="off" value={message} onChange={handleOnChangeMessage} autoFocus />
              </div>
              <div className="flex justify-between gap-2 flex-wrap">
                <div className="flex-grow w-4/5"></div>
                <button type={"submit"} className="btn btn-secondary btn-sm" disabled={wakuStatus !== "Ready"}>Send message</button>
              </div>

              <div>
                <ul>
                  {messages.map((item, key) => {
                    return (
                      <li key={key}>
                        <p>
                          {item.username}: {item.text}
                          <span
                            className={"float-right text-xs"}>{String(item.date.getHours()).padStart(2, "0")}:{String(item.date.getMinutes()).padStart(2, "0")}:{String(item.date.getSeconds()).padStart(2, "0")}</span>
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};


export default MafiaGame;
