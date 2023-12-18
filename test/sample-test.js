// const { expect, assert } = require("chai");
// const { ethers } = require("hardhat");

// describe("dispute creation and resolution", () => {
//   const mockUrl = "ipfs-mock-url";
//   const stakeAmount = ethers.utils.parseUnits("0.02", "ether");
//   let arbiterContractAddresss = "";
//   let _arbiterContract;
//   let disputeContract;
//   let disputeContractAddresss = "";
//   let bobAsSigner;
//   let alexAsSigner;
//   let aliceAsSigner;
//   let rachelAsSigner;
//   let oluchiAsSigner;
//   let deployerasSigner;
//   let kamsiAsSigner
//   let kobyAsSigner
//   let kamkamAsSigner
//   let kaimaAsSigner;

//   it("Should add an arbiter to the smart contract", async () => {
//     //Get mock signers for the transcation
//     [
//       deployerasSigner,
//       bobAsSigner,
//       aliceAsSigner,
//       alexAsSigner,
//       rachelAsSigner,
//       oluchiAsSigner,
//       onahAsSigner,
//       kamsiAsSigner,
//       kobyAsSigner,
//       kamkamAsSigner,
//       kaimaAsSigner
//     ] = await ethers.getSigners();

//     //Create an instance of the arbiter smart contract
//     const arbiter = await ethers.getContractFactory("ArbiterWhitelister");
//     const arbiterContract = await arbiter.deploy();
//     await arbiterContract.deployed();

//     arbiterContractAddresss = arbiterContract.address;
//     _arbiterContract = arbiterContract

//     //Bob tries to mint arbiter token before he is added as an arbiter
//     // try {
//     //   await arbiterContract.connect(bobAsSigner).createToken();
//     // }
//     // catch (err) {
//     //   assert.equal("VM Exception while processing transaction: reverted with reason string 'You need to be whitelisted'", err.message)
//     // }

//     //Deployer Adds bob as an arbiter from the arbiterNft smart contract, this is only callable by the deployer of the app
//     await arbiterContract.addUser(bobAsSigner.address);
//     await arbiterContract.addUser(alexAsSigner.address);
//     await arbiterContract.addUser(aliceAsSigner.address);
//     await arbiterContract.addUser(rachelAsSigner.address);
//     await arbiterContract.addUser(oluchiAsSigner.address);
//     await arbiterContract.addUser(kamsiAsSigner.address);
//     await arbiterContract.addUser(kamkamAsSigner.address);
//     await arbiterContract.addUser(kaimaAsSigner.address);
//     //await arbiterContract.addUser(AsSigner.address);


//     let isBobAnArbiter = await arbiterContract.verifyUser(bobAsSigner.address);

//     //console.log(isBobAnArbiter, "bool");
//     //Now bob can actually mint his Arbiter Nft
//     // await arbiterContract.connect(bobAsSigner).createToken();
//   });

//   it("should initiate a dispute", async () => {
//     [deployerasSigner, bobAsSigner, aliceAsSigner, alexAsSigner] =
//       await ethers.getSigners();

//     const provider = await ethers.getDefaultProvider();
//     const disputePool = await ethers.getContractFactory("Disputepool");
//     const disputePoolContract = await disputePool.deploy(
//       arbiterContractAddresss
//     );
//     await disputePoolContract.deployed();
//     disputeContract = disputePoolContract;
//     disputeContractAddresss = disputeContract.address;
//     //Alice wants to initiate a dispute

//     //Alice tries to initiate a dispute without sending any stake
//     // try {
//     //   await disputePoolContract.connect(aliceAsSigner).createDispute(mockUrl);
//     // }
//     // catch (err) {
//     //   assert.equal(err.message, "VM Exception while processing transaction: reverted with reason string 'Must send stake amount greater or equal to contract's staked amount'");
//     // }

//     const balance0ETHg = await disputePoolContract.getBalance();
//    // console.log(balance0ETHg.toString(), "bal");
//     //Alice initiates a dispute by staking 341000000000000 wei (1 Matic) and sending URL holding dispute information
//     await disputePoolContract
//       .connect(aliceAsSigner)
//       .createDispute(mockUrl, { value: stakeAmount });
//     //Next we will try to get all disputes in the contract
//     let disputes = await disputePoolContract.getAllDisputes();

//     //We will get the first dispute from the list and check its dispute Id and URL
//     let aliceDispute = disputes[0];

//     assert.equal(aliceDispute.uri, mockUrl);
//     assert.equal(aliceDispute.disputeId, 1);

//     //We will check the contract balance of the dispute pool
//     const disputePoolContractBalance = await disputePoolContract.getBalance();
//     // console.log(
//     //   disputePoolContractBalance,
//     //   "is the dispute pool contract balance"
//     // );
//   });

//   //   it("should select three arbiters from the dispute pool", async () => {
//   //     //Get signers
//   //     const [deployerasSigner, bobAsSigner, aliceAsSigner, alexAsSigner, rachelAsSigner, oluchiAsSigner, udokaAsSigner] = await ethers.getSigners();

//   //     //declare dispute contract
//   //     const provider = await ethers.getDefaultProvider();
//   //     const disputePool = await ethers.getContractFactory("Disputepool");
//   //     const disputePoolContract = await disputePool.deploy();
//   //     disputePoolContract.deployed();
//   //     const disputeContractAddress = disputePoolContract.address;
//   //     disputeContractAddresss = disputeContractAddress;

//   //     //declare randomness contract
//   //     //const provider = await ethers.getDefaultProvider();
//   //     const random = await ethers.getContractFactory("Randomizer");
//   //     const randomContract = await disputePool.deploy();
//   //     randomContract.deployed();
//   //     const randomContractAddress = randomContract.address;

//   //     //requestRandomWords
//   //     // await randomContract.requestRandomWords();
//   //     //fulfillRandomWords
//   //     // await randomContract.fulfillRandomWords();
//   //     // //s_randomWords
//   //     // await randomContract.fulfillRandomWords();

//   //     //Create a dispute
//   //     await disputePoolContract.connect(aliceAsSigner).createDispute(mockUrl, { value: stakeAmount });
//   //     //Next we will try to get all disputes in the contract

//   //     // Arbiters will apply to be added to the dispute with a fixed staked amount
//   //     //Pov: a person tries to apply without sending any stake
//   //     try {
//   //       await disputePoolContract.addUserToDisputePool(arbiterContractAddresss, 1);
//   //     } catch (err) {
//   //       assert.equal(err.message, "VM Exception while processing transaction: reverted with reason string 'Must send stake amount greater or equal to contract's staked amount'");
//   //     }

//   //     //POV: a non arbiter tries to join the pool
//   //     try {
//   //       await disputePoolContract.connect(udokaAsSigner).addUserToDisputePool(arbiterContractAddresss, 1, { value: stakeAmount });

//   //     } catch (err) {
//   //       console.log(err)
//   //       assert.equal(err.message, "VM Exception while processing transaction: reverted with reason string 'Sender is not an arbiter'");
//   //     }
//   //     console.log("I am here")

//   //     await disputePoolContract.connect(bobAsSigner).addUserToDisputePool(arbiterContractAddresss, 1, { value: stakeAmount });
//   //     await disputePoolContract.connect(alexAsSigner).addUserToDisputePool(arbiterContractAddresss, 1, { value: stakeAmount });
//   //     await disputePoolContract.connect(aliceAsSigner).addUserToDisputePool(arbiterContractAddresss, 1, { value: stakeAmount });
//   //     await disputePoolContract.connect(rachelAsSigner).addUserToDisputePool(arbiterContractAddresss, 1, { value: stakeAmount });
//   //     await disputePoolContract.connect(oluchiAsSigner).addUserToDisputePool(arbiterContractAddresss, 1, { value: stakeAmount });
//   //     let v = await disputePoolContract.getAddAddress(1);

//   //     console.log(v.length, "v");

//   //     //Close dispute so no one can apply for its resolution
//   //     let txn = await disputePoolContract.closeDisputeApplication(1);
//   //     await txn.wait();
//   //     // A random generator will give us three numbers
//   //     //this case (1, 3,5)
//   //     // Three Arbiters that correspond to the number from the random generator will be added
//   //     let tx = await disputePoolContract.getRandomArbiters(0, 2, 4, 1);
//   //     await tx.wait();

//   //     v = await disputePoolContract.getAddAddress(1);
//   //     console.log(v, "v")

//   //     //Create an instance of the voting smart contract
//   //     const voter = await ethers.getContractFactory("ArbiterVotingTwo");
//   //     const voterContract = await voter.deploy();
//   //     await voterContract.deployed();

//   //     votingContractAddresss = voterContract.address;

//   //     //Create an instance of the Ballot
//   //     await (await voterContract.createBallot(v, 1)).wait();

//   //     //Bob tries to vote
//   //     await (await voterContract.connect(bobAsSigner).vote(1, 0)).wait()
//   //     //alex tries to vote will throw an error
//   //     try {
//   //       await (await voterContract.connect(alexAsSigner).vote(1, 0)).wait()
//   //     }
//   //     catch (err) {
//   //       assert.equal(err.message, "VM Exception while processing transaction: reverted with reason string 'Unauthorized to vote'");
//   //     }

//   //     //Try to get a winner when only one person has voted
//   //     // await (await voterContract.computeWinner(0)).wait();

//   //     //alice tries to vote with number 0
//   //     await (await voterContract.connect(aliceAsSigner).vote(1, 0)).wait();

//   //     //Bob tries to vote
//   //     await (await voterContract.connect(oluchiAsSigner).vote(2, 0)).wait()
//   //     //await tesTxn.wait()

//   //     //Try to get a winner when only all three person has voted
//   //     let res = await (await voterContract.computeWinner(0)).wait();
//   //     //  console.log(res, "res")

//   //     let [winningOption, disputeId] = await voterContract.getWinner(0);
//   //     console.log(winningOption.toString(), "resd")
//   // let winner = +(winningOption.toString())

//   //     let preBal = await oluchiAsSigner.getBalance()
//   //     console.log(preBal, "preBAl")
//   //     let resolveTransaction = await disputePoolContract.resolveDispute(1, winner);
//   //     await resolveTransaction.wait()
//   //     console.log(resolveTransaction, "resolveTransaction");

//   //     let postBal = await oluchiAsSigner.getBalance()
//   //     console.log(postBal, "postBAl")

//   //   })
//   it("should allow an arbiter join a dispute", async () => {
//         console.log(await alexAsSigner.getBalance(), "Gefore Alex Stakes");
//     await disputeContract
//       .connect(alexAsSigner)
//       .joinDisputePool(1, { value: stakeAmount });

//     await disputeContract
//       .connect(bobAsSigner)
//       .joinDisputePool(1, { value: stakeAmount });

//     await disputeContract
//       .connect(rachelAsSigner)
//       .joinDisputePool(1, { value: stakeAmount });

//     // await disputeContract
//     //   .connect(oluchiAsSigner)
//     //   .joinDisputePool(1, { value: stakeAmount });

//     // await disputeContract
//     //   .connect(aliceAsSigner)
//     //   .joinDisputePool(1, { value: stakeAmount });

//     const balance0ETHg = await disputeContract.getBalance();
//     //console.log(balance0ETHg.toString(), "bal");
//   });

//   it("should assign random arbiters based on random values", async () => {
//     await disputeContract.changeDisputeState(1, 1);
//     await disputeContract.assignRandomArbiters(1, [0, 1, 2]);

//     let disputes = await disputeContract.getAllDisputes();
//    // console.log(disputes[0], "End");
//   });

//   it("should allow a selected arbiter to vote", async () => {    
//     // console.log(alexAsSigner.address, "Alice Address");
//     // console.log(bobAsSigner.address, "Bob Address");
//     // console.log(rachelAsSigner.address, "Rachel Address");

//     console.log(await alexAsSigner.getBalance(), "Before Alex Votes");

//    await disputeContract.connect(alexAsSigner).vote(1, 1);
//        console.log(await alexAsSigner.getBalance(), "After Alex Votes");
//     await disputeContract.connect(bobAsSigner).vote(1, 1);
//     //await disputeContract.connect(aliceAsSigner).vote(1, 1);


//     await disputeContract.connect(rachelAsSigner).vote(1, 1);

//     let disputes = await disputeContract.getAllDisputes();
//    // console.log((disputes.length), "End");
//   });

//   it("should allow owner end the voting process", async () => {    
//     await disputeContract.changeDisputeState(1, 1);

    
//     await disputeContract.endVoting(1);   
//     console.log(await alexAsSigner.getBalance(), "Alex Balance Afetr Voting ends");


//     let disputes = await disputeContract.getAllDisputes();
//     await rachelAsSigner.getBalance();
//    // console.log(disputes, "End");
//   });
  
//   it("should send validators their stake after voing process ahs ended", async () => {
    
//     let disputes = await disputeContract.getAllDisputes();
//     await rachelAsSigner.getBalance();
//    // console.log(disputes, "End");
//   });

//   it("should create the decision NFT", async () => {
   
//     const decisionNFT = await ethers.getContractFactory("MkpebiResolutio");
//     const decisionNFTContract = await decisionNFT.deploy(
//       disputeContractAddresss
//     );
//     await decisionNFTContract.deployed();

//     decisionNFTContract.mintToken(10, mockUrl);

//     console.log(await decisionNFTContract.balanceOf(deployerasSigner.address, 1));

//     await decisionNFTContract.airDropToken(1, 1, [alexAsSigner.address, rachelAsSigner.address, bobAsSigner.address]);

//     console.log(
//       await decisionNFTContract.balanceOf(rachelAsSigner.address, 1)
//     );

//     console.log(
//       await decisionNFTContract.balanceOf(alexAsSigner.address, 1)
//     );

//     console.log(
//       await decisionNFTContract.balanceOf(bobAsSigner.address, 1)
//     );

//     console.log(
//       await decisionNFTContract.balanceOf(deployerasSigner.address, 1)
//     );    
//   })
// });

// //Add decisionTokenId to dispute
// //Add a method to set decision TokenId
// //I should not be able to join a dispute more than once
// //I shpuld not be able to join a adipute I created
//Change contract state should not try to change a contract stae if it is more than

// // let bobAsSigner;
// // let alexAsSigner;
// // let aliceAsSigner;
// // let rachelAsSigner;
// // let oluchiAsSigner;
// // let deployerasSigner;