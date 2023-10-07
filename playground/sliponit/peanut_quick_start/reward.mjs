
import peanut from '@squirrel-labs/peanut-sdk';
import { ethers } from "ethers";

const CHAINID = 84531 // base goerli
const RPC_URL = 'https://goerli.base.org'
const mnemonic = 'rigid brush collect purse vacant mom hunt stove cry denial cannon axis'
const API_KEY = 'nIidGvk9Vh5yxyktHEYgLJeWhIpYZGen';


async function reward([address1, address2, address3, address4]) {
    if (!address1) return

    let tokenAmount = .001
    if (address4) tokenAmount = .00025
    else if (address3) tokenAmount = .00033
    else if (address2) tokenAmount = .0005

    let walletMnemonic = ethers.Wallet.fromMnemonic(mnemonic)
    const address = await walletMnemonic.getAddress();
    console.log("Sender address: " + address);

    const wallet = new ethers.Wallet(
        walletMnemonic.privateKey,
        new ethers.providers.JsonRpcProvider(RPC_URL));

    const params = {
        structSigner: {
            signer: wallet
        },
        linkDetails: {
            chainId: CHAINID,
            tokenAmount: tokenAmount,
            tokenType: 0,  // 0 for ether, 1 for erc20, 2 for erc721, 3 for erc1155
        }
    }

    // create link
    const claimTransactions = [];
    for (let recipientAddress of [address1, address2, address3, address4]) {
        if (!recipientAddress) break

        const createLinkResponse = await peanut.createLink(params);
        const link = createLinkResponse.createdLink.link[0]
        console.log("New link: " + link);
        const claimTx = await peanut.claimLinkGasless({
            recipientAddress: recipientAddress,
            link: link,
            APIKey: API_KEY
        })
        console.log('success: ', claimTx)
        // TODO?? throw if claimTx !== 'success'
        claimTransactions.push(claimTx.tx_hash)
    }

    console.log('success: ', claimTransactions)
    return claimTransactions.map(str => 'https://goerli.basescan.org/tx/' + str)
}

await reward([
    '0xf8b046c273dF0334dec0c08b1Dfcd323cc1C04aE',
    '0x0AF858Ce3a3A1BcDFFCBF863d9010FF588Cb38B8',
])
