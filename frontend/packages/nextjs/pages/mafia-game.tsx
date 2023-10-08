import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { createDecoder, createEncoder, createLightNode, DecodedMessage, LightNode, Protocols, waitForRemotePeer } from "@waku/sdk";
import protobuf from "protobufjs";
import { MetaHeader } from "~~/components/MetaHeader";
import { useAccount } from "wagmi";
import axios from "axios";

const CONTENT_TOPIC = `/privateMafiaGame/1/chat-132/proto`;
const ENCODER = createEncoder({ contentTopic: CONTENT_TOPIC });
const DECODER = createDecoder(CONTENT_TOPIC);

const BACKEND_ENDPOINT = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "http://localhost:3003";

const SIMPLE_CHAT_MESSAGE = new protobuf.Type("SimpleChatMessage")
  .add(new protobuf.Field("timestamp", 1, "uint64")) // TODO: some optimisation may be needed here
  .add(new protobuf.Field("text", 2, "string"))
  .add(new protobuf.Field("username", 3, "string"))
  .add(new protobuf.Field("newPlayerUsername", 4, "string")); // Pushed by the BOT when a new player connects // TODO: there is a better way to do it for sure

const MafiaGame = () => {
  const { address, isConnected } = useAccount();

  const [username, setUsername] = useState<string>("");
  const [wakuNode, setWakuNode] = useState<LightNode | null>(null);
  const [wakuStatus, setWakuStatus] = useState<"Starting" | "Connecting" | "Ready" | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<{ date: Date, username: string, text: string }[]>([]);
  const [connectedPlayers, setConnectedPlayers] = useState<{
    username: string, role: "MAFIA" | "SHERIFF" | "TOWNSPEOPLE" | null
  }[]>([]);
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);
  const [isGameAccessible, setIsGameAccessible] = useState<boolean>(true);

  // start waku using relay protocol and enabling some privacy preserving properties (wakuGossipSub)
  // TODO: implement catch to throw sexy toast error
  async function startWakuNode() {
    setWakuStatus("Starting");

    const node = await createLightNode({ defaultBootstrap: true });
    await node.start();
    setWakuStatus("Connecting");
    await waitForRemotePeer(node, [Protocols.LightPush, Protocols.Filter, Protocols.Store]);
    setWakuStatus("Ready");

    setWakuNode(node);
    return node;
  }

  // Retrieve incoming messages
  // TODO: Consider caching this function using "useCallback" (it may enhance performance when retrieving a lot of messages)
  const retrieveIncomingWakuMessage = (wakuMessage: DecodedMessage) => {
    // Decode message

    // @ts-ignore
    const { username, text, timestamp, newPlayerUsername }: { username: string | "BOT", text: string, timestamp: number, newPlayerUsername: string } = SIMPLE_CHAT_MESSAGE.decode(wakuMessage.payload);

    const date = new Date(timestamp);

    setMessages(prev => [{ username, text, date }, ...prev]);

    if (newPlayerUsername) setConnectedPlayers(prev => [{ username: newPlayerUsername, role: null }, ...prev]);
  };

  // On mount: starts waku on relay node + subscribe to topic to retrieve messages of a certain topic
  useEffect(() => {
    if (!address) return;

    setUsername(address as string);
    startWakuNode().then(node => {
      const subscriber = node.filter.subscribe(
        [DECODER],
        retrieveIncomingWakuMessage
      );

      return { node, subscriber };

    }).then(item => {
      // Get connected players in the game. Max players in the game = 6
      // countConnectedPlayers(item.node).then(total => {
      //   if (total < 6) {
      setIsChatVisible(true);
      getOldMessages(item.node).then(() => {
        newPlayerChatBotNotification(`${address} just joined the game!`, address, item.node);

        const eventSource = new EventSource(BACKEND_ENDPOINT + "/events?playerName=" + address);

        eventSource.addEventListener("GET_UUID", (event) => {
          // TODO: problem while parsing EventStream data. We spent hours without finding a good implementation ...
          const stringWithoutEndQuote = event.data.replace(/^"|"$/g, "");
          const cleanedStringWithoutAntiSlash = stringWithoutEndQuote.replace(/\\/g, "");

          const { uuid }: { uuid: string } = JSON.parse(cleanedStringWithoutAntiSlash);
        });

        eventSource.addEventListener("GAME_STARTED", (event) => {
          console.log(event.data);
          // TODO: problem while parsing EventStream data. We spent hours without finding a good implementation ...
          const stringWithoutEndQuote = event.data.replace(/^"|"$/g, "");
          const cleanedStringWithoutAntiSlash = stringWithoutEndQuote.replace(/\\/g, "");

          const data = JSON.parse(cleanedStringWithoutAntiSlash);
          setConnectedPlayers(prev => {
            prev.map(item => {
              data.players.map((item_: any) => {
                if(item.username == item_.username) item.role = item_.role
              })
            })

            return [...prev]
          })
        });

        return () => {
          eventSource.close();
        };
      });
      // } else {
      //   setIsGameAccessible(false);
      //   item.node.stop().then();
      // }
      // });
    });
  }, [address]);

  function sendMessage(text: string, username: string, node: LightNode) {
    const date = new Date();
    const timestamp = date.getTime();

    // Create message
    const blueprint = SIMPLE_CHAT_MESSAGE.create({ timestamp, text, username });

    // Encode message
    const payload = SIMPLE_CHAT_MESSAGE.encode(blueprint).finish();

    processSendingMessage(text).then();

    // Send waku message over waku relay node
    node.lightPush.send(ENCODER, { payload }).then(() => {
      setMessage("");
    });
  }


  async function processSendingMessage(text: string) {
    if (text.includes("/ready")) {
      const uuid = localStorage.getItem("mafia-chat-uuid");
      await axios.post(BACKEND_ENDPOINT + "/playerready", { uuid: username });
    }

    if (text.includes("/mafia")) {
      // const player = text.split(" ")[1];
    }
  }

  // Bot notifies new player arrival in the chat
  function newPlayerChatBotNotification(text: string, newPlayerUsername: string, node: LightNode) {
    const date = new Date();
    const timestamp = date.getTime();

    // Create message with newPlayerUsername and username as "BOT"
    const blueprint = SIMPLE_CHAT_MESSAGE.create({ timestamp, text, username: "BOT", newPlayerUsername });

    // Encode message
    const payload = SIMPLE_CHAT_MESSAGE.encode(blueprint).finish();

    // Send waku message over waku relay node
    node.lightPush.send(ENCODER, { payload }).then();
  }

  const handleOnChangeMessage = (e: ChangeEvent<HTMLInputElement>) => {
    const message = e.target.value;
    setMessage(message);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission

    sendMessage(message, username, wakuNode as LightNode);
  };

  async function getOldMessages(node: LightNode) {
    // This will store all the messages to render them in the chat + it will set the player board
    const callback = (wakuMessage: DecodedMessage) => {
      // @ts-ignore
      const { username, text, timestamp }: { username: string, text: string, timestamp: number } = SIMPLE_CHAT_MESSAGE.decode(wakuMessage.payload);

      const date = new Date(timestamp);

      setMessages(prev => [...prev, { username, text, date }]);
    };

    // Query the Store peer
    await node.store.queryWithOrderedCallback(
      [DECODER],
      callback
    );
  }

  // Used when a new player comes to the chat. This will count the players that are already in the game
  async function countConnectedPlayers(node: LightNode) {
    // Create the store query
    const storeQuery = node.store.queryGenerator([DECODER]);

    // Process the messages
    let playerCounter = 0;
    for await (const messagesPromises of storeQuery) {
      // Fulfil the messages promises
      await Promise.all(messagesPromises
        .map(async (p) => {
          const wakuMessage = await p;
          // @ts-ignore
          const { newPlayerUsername }: { newPlayerUsername: string } = SIMPLE_CHAT_MESSAGE.decode(wakuMessage.payload);

          if (newPlayerUsername) {
            setConnectedPlayers(prev => [{ username: newPlayerUsername, role: null }, ...prev]);
            playerCounter += 1;
          }
        })
      );
    }

    return playerCounter;
  }


  const Chat = ({ className }: { className: string }) => (
    <form className={className} onSubmit={handleSubmit}>
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

            {isChatVisible &&
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
            }
          </div>
        </div>
      </div>
    </form>
  );

  const ConnectedPlayers = ({ className }: { className: string }) => (

    <form className={className} onSubmit={handleSubmit}>
      <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-10 relative">
        <div className="p-5 divide-y divide-base-300">
          <h2 className={"text-2xl font-bold"}>Connected players ({connectedPlayers.length})</h2>
          <div className={"pt-2"}>
            {connectedPlayers.map(item => (
              <div key={item.username}>- {item.username} : {item.role ? item.role : "No role"}</div>
            ))}
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <>
      {/*Meta*/}
      <MetaHeader title="Mafia game" description="Mafia game demo">
      </MetaHeader>
      {/*{localStorage.getItem('mafia-chat-uuid')}*/}
      <div className="grid grid-cols-3 p-5">
        {isGameAccessible && <>
          <Chat className={"z-10 col-span-2 mr-4"} />

          <ConnectedPlayers className={"z-10 col-span-1 mr-4"} />
        </>}

      </div>
    </>
  );
};


export default MafiaGame;
