# Official Resolutio Smartcontract Project

## Relevant Contract Addresses:
#### ArbiterWhiteLister Contract Address 
- 0xEE1A1940B63C95af84E6CCeC764B341f75331ED0
#### ChainLink Random Number Generator
- 0x15C89FAa1b28BA3D667F05aA871484254e01C9EE
#### DisputeInitiation Contract Address
- 0x026716248a42297055a703E515daA0c60AA71872
#### Decision NFT Contract Address
- 0x003D7429245c4D9E7B678356c26286F71C5b6A7d

## NOTE
For test purposes, the stake amount for any process within the contract is 0.02 Link (or 20000000000000000 wei)
This amount has to be staked when
- Creating a dispute as a user
- Joining a dispute as an arbiter

//Todo
- When dispute contract is initialized, create a default dispute with value 0 as disputeid 
- (FE): Send appropiate error message when user rejects a transaction from metamask
- Add check so that an arbiter cannot join a dispute that he created✅