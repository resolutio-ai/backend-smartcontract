# Official Resolutio Smartcontract Project

## Relevant Contract Addresses:
#### ArbiterWhiteLister Contract Address 
- 0xEE1A1940B63C95af84E6CCeC764B341f75331ED0
#### ChainLink Random Number Generator
- 0x15C89FAa1b28BA3D667F05aA871484254e01C9EE
#### DisputeInitiation Contract Address
- 0x9f782204da991DAb19e0C4E7754CDf3AC381Da3f

## NOTE
For test purposes, the stake amount for any process within the contract is 0.02 Link (or 20000000000000000 wei)
This amount has to be staked when
- Creating a dispute as a user
- Joining a dispute as an arbiter

//Todo
- When dispute contract is initialized, create a default dispute with value 0 as disputeid 
- Send appropiate error message when user rejects a transaction from metamask
- Add check so that an arbiter cannot join a dispute that he created