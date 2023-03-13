# Official Resolutio Smartcontract Project

## Relevant Contract Addresses:
#### ArbiterWhiteLister Contract Address 
- 0x106594F1422c75cbE804A623D303E49D52F0b07F
#### ChainLink Random Number Generator
- 0x15C89FAa1b28BA3D667F05aA871484254e01C9EE
#### DisputeInitiation Contract Address
- 0x44EDF917Bc4dCc7BCB57515E0401Ff43170D49Bf
#### Decision NFT Contract Address
- 0xE42a424dd727A13b1fefb41FE81B52675665DA3f

## NOTE
For test purposes, the stake amount for any process within the contract is 0.02 Link (or 20000000000000000 wei)
This amount has to be staked when
- Creating a dispute as a user
- Joining a dispute as an arbiter

//Todo
- When dispute contract is initialized, create a default dispute with value 0 as disputeid 
- (FE): Send appropiate error message when user rejects a transaction from metamask
- Add check so that an arbiter cannot join a dispute that he created✅