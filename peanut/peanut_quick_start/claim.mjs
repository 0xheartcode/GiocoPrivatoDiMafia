
import peanut from '@squirrel-labs/peanut-sdk';

const API_KEY = 'nIidGvk9Vh5yxyktHEYgLJeWhIpYZGen'; 
const link = 'https://peanut.to/claim#?c=420&v=v4&i=461&p=DG0Ch72U3SgQ73d8&t=sdk';

const recipientAddress = '0xe0FF3fD7AC34B4d7f78375628C30d0A102Bc8f9a';
console.log("Test address: " + recipientAddress);

// get status of link
// const getLinkDetailsResponse = await peanut.getLinkDetails({
// 	link, provider
// })
// console.log('The link is claimed: ' + getLinkDetailsResponse.claimed)

// claim link
const claimTx = await peanut.claimLinkGasless({
  recipientAddress: recipientAddress,
  link: link,
  APIKey: API_KEY
})
console.log('success: ' + claimTx.success + 'claimTx: ' + claimTx.txHash)
