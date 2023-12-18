const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("dispute creation and resolution Main", () => {
  const mockUrl = "ipfs-mock-url";
  const stakeAmount = ethers.utils.parseUnits("0.02", "ether");
  let arbiterContractAddresss = "";
  let _arbiterContract;
  let disputeContract;
  let disputeContractAddresss = "";
  let finalDecisionContract;
  let finalDecisionContractAddress = "";
  let bobAsSigner;
  let alexAsSigner;
  let aliceAsSigner;
  let rachelAsSigner;
  let oluchiAsSigner;
  let deployerasSigner;
  let kamsiAsSigner;
  let kobyAsSigner;
  let kamkamAsSigner;
  let kaimaAsSigner;
  let chinenyeAsSigner;

  it("Should add an arbiter to the smart contract", async () => {
    //Get mock signers for the transcation
    [
      deployerasSigner,
      bobAsSigner,
      aliceAsSigner,
      alexAsSigner,
      rachelAsSigner,
      oluchiAsSigner,
      onahAsSigner,
      kamsiAsSigner,
      kobyAsSigner,
      kamkamAsSigner,
      kaimaAsSigner,
      chinenyeAsSigner,
    ] = await ethers.getSigners();

    //Create an instance of the arbiter smart contract
    const arbiter = await ethers.getContractFactory("ArbiterWhitelister");
    const arbiterContract = await arbiter.deploy();
    await arbiterContract.deployed();

    arbiterContractAddresss = arbiterContract.address;
    _arbiterContract = arbiterContract;

    //User verification returns false for arbiters that have not been whitelisted
    assert.isFalse(await arbiterContract.verifyUser(bobAsSigner.address));
    assert.isFalse(await arbiterContract.verifyUser(kobyAsSigner.address));
    assert.isFalse(await arbiterContract.verifyUser(alexAsSigner.address));
    assert.isFalse(await arbiterContract.verifyUser(aliceAsSigner.address));
    assert.isFalse(await arbiterContract.verifyUser(rachelAsSigner.address));
    assert.isFalse(await arbiterContract.verifyUser(oluchiAsSigner.address));
    assert.isFalse(await arbiterContract.verifyUser(kamsiAsSigner.address));
    assert.isFalse(await arbiterContract.verifyUser(kamkamAsSigner.address));
    assert.isFalse(await arbiterContract.verifyUser(kaimaAsSigner.address));

    //Deployer Adds bob as an arbiter from the arbiterNft smart contract, this is only callable by the deployer of the app
    await arbiterContract.addUser(bobAsSigner.address);
    await arbiterContract.addUser(alexAsSigner.address);
    await arbiterContract.addUser(aliceAsSigner.address);
    await arbiterContract.addUser(rachelAsSigner.address);
    await arbiterContract.addUser(oluchiAsSigner.address);
    await arbiterContract.addUser(kamsiAsSigner.address);
    await arbiterContract.addUser(kamkamAsSigner.address);
    await arbiterContract.addUser(kaimaAsSigner.address);
    await arbiterContract.addUser(kobyAsSigner.address);

    //await arbiterContract.addUser(AsSigner.address);

    let isBobAnArbiter = await arbiterContract.verifyUser(bobAsSigner.address);

    //console.log(isBobAnArbiter, "bool");
    assert.isTrue(isBobAnArbiter);
    assert.isTrue(await arbiterContract.verifyUser(kobyAsSigner.address));
    assert.isTrue(await arbiterContract.verifyUser(alexAsSigner.address));
    assert.isTrue(await arbiterContract.verifyUser(aliceAsSigner.address));
    assert.isTrue(await arbiterContract.verifyUser(rachelAsSigner.address));
    assert.isTrue(await arbiterContract.verifyUser(oluchiAsSigner.address));
    assert.isTrue(await arbiterContract.verifyUser(kamsiAsSigner.address));
    assert.isTrue(await arbiterContract.verifyUser(kamkamAsSigner.address));
    assert.isTrue(await arbiterContract.verifyUser(kaimaAsSigner.address));
  });

  it("should initiate a dispute", async () => {
    const disputePool = await ethers.getContractFactory("Disputepool");
    const disputePoolContract = await disputePool.deploy(
      arbiterContractAddresss
    );
    await disputePoolContract.deployed();
    disputeContract = disputePoolContract;
    disputeContractAddresss = disputeContract.address;

    //POV: Alice wants to initiate a dispute

    //Alice tries to initiate a dispute without sending any stake
    let invalidTransaction = disputePoolContract
      .connect(aliceAsSigner)
      .createDispute(mockUrl);

    await expect(invalidTransaction).to.be.revertedWith("Invalid stake");

    //Alice initiates a dispute by staking 20000000000000 wei (1 Matic) and sending URL holding dispute information
    await disputePoolContract
      .connect(aliceAsSigner)
      .createDispute(mockUrl, { value: stakeAmount });

    //Contract balance must have increased by stakeAmount
    expect(await disputePoolContract.getBalance()).to.be.eq(stakeAmount);

    //Next we will try to get all disputes in the contract
    let disputes = await disputePoolContract.getAllDisputes();

    //We will get the first dispute from the list and check its dispute Id and URL
    let aliceDispute = disputes[0];

    assert.equal(aliceDispute.uri, mockUrl);
    assert.equal(aliceDispute.disputeId, 1);
  });

  it("should allow an arbiter join a dispute", async () => {
    let initaialAlexBalance = await alexAsSigner.getBalance();
    let initaialBobBalance = await bobAsSigner.getBalance();
    let initaialRachelBalance = await rachelAsSigner.getBalance();

    //console.log(await alexAsSigner.getBalance(), "Gefore Alex Stakes");
    await disputeContract
      .connect(alexAsSigner)
      .joinDisputePool(1, { value: stakeAmount });

    await disputeContract
      .connect(bobAsSigner)
      .joinDisputePool(1, { value: stakeAmount });

    await disputeContract
      .connect(rachelAsSigner)
      .joinDisputePool(1, { value: stakeAmount });

    await disputeContract
      .connect(kaimaAsSigner)
      .joinDisputePool(1, { value: stakeAmount });

    expect(await alexAsSigner.getBalance()).to.not.be.eq(initaialAlexBalance);
    expect(await rachelAsSigner.getBalance()).to.not.be.eq(
      initaialRachelBalance
    );
    expect(await bobAsSigner.getBalance()).to.not.be.eq(initaialBobBalance);

    //Contract balance must have increased by stakeAmount
    expect((await disputeContract.getBalance()).toString()).to.be.eq(
      (stakeAmount * 5).toString()
    );
  });

  it("should not allow a user to join a dispute more than once", async () => {
    await expect(
      disputeContract
        .connect(alexAsSigner)
        .joinDisputePool(1, { value: stakeAmount })
    ).to.be.revertedWith("Already Joined");
  });

  it("should not allow a user to join a dispute she created", async () => {
    await expect(
      disputeContract
        .connect(aliceAsSigner)
        .joinDisputePool(1, { value: stakeAmount })
    ).to.be.revertedWith("Sender is Dispute Owner");
  });

  it("should assign random arbiters based on random values", async () => {
    await disputeContract.changeDisputeState(1, 1);
    await disputeContract.assignRandomArbiters(1, [1, 0, 2]);

    let disputes = await disputeContract.getAllDisputes();
    //  console.log(disputes[0].state, "EndOne");
  });

  it("should allow only selected arbiters to vote", async () => {
    await disputeContract.connect(bobAsSigner).vote(1, 1);
    await disputeContract.connect(alexAsSigner).vote(1, 1);
    await disputeContract.connect(rachelAsSigner).vote(1, 1);
  });

  it("should prevent an arbiter from voting more than once", async () => {
    await expect(
      disputeContract.connect(rachelAsSigner).vote(1, 1)
    ).to.be.revertedWith("Already Voted");

    await expect(
      disputeContract.connect(alexAsSigner).vote(1, 1)
    ).to.be.revertedWith("Already Voted");

    await expect(
      disputeContract.connect(bobAsSigner).vote(1, 1)
    ).to.be.revertedWith("Already Voted");
  });

  it("should allow owner end the voting process after state has been changed and return stake", async () => {
    let alexBalance = await alexAsSigner.getBalance();
    let rachelBalance = await rachelAsSigner.getBalance();
    let bobBalance = await bobAsSigner.getBalance();

    await expect(disputeContract.endVoting(1)).to.be.revertedWith(
      "Invalid State"
    );

    //Change dispute state
    await disputeContract.changeDisputeState(1, 1);

    //End Voting Process
    await disputeContract.endVoting(1);

    //Arbiters have received their refund
    expect(await alexAsSigner.getBalance()).to.be.eq(
      stakeAmount.add(alexBalance)
    );
    expect(await rachelAsSigner.getBalance()).to.be.eq(
      stakeAmount.add(rachelBalance)
    );
    expect(await bobAsSigner.getBalance()).to.be.eq(
      stakeAmount.add(bobBalance)
    );
  });

  it("should mint the decision NFT to deployers balance", async () => {
    const decisionNFT = await ethers.getContractFactory("MkpebiResolutio");
    const decisionNFTContract = await decisionNFT.deploy(
      disputeContractAddresss
    );
    await decisionNFTContract.deployed();
    finalDecisionContract = decisionNFTContract;
    finalDecisionContractAddress = decisionNFTContract.address;

    await decisionNFTContract.mintToken(1, 10, mockUrl);

    expect(
      await decisionNFTContract.balanceOf(deployerasSigner.address, 1)
    ).to.be.eq(ethers.BigNumber.from(10));
  });

  it("should not be able to mint decision NFT for non existent dispute", async () => {
    expect(finalDecisionContract.mintToken(1, 10, mockUrl)).to.be.revertedWith(
      "Invalid Dispute Id"
    );
  });

  it("should not be able to mint decision NFT for dispute that has not ended", async () => {
    await disputeContract
      .connect(chinenyeAsSigner)
      .createDispute(mockUrl, { value: stakeAmount });

    expect(finalDecisionContract.mintToken(2, 10, mockUrl)).to.be.revertedWith(
      "Invalid Dispute Id"
    );

    await disputeContract
      .connect(alexAsSigner)
      .joinDisputePool(2, { value: stakeAmount });

    await disputeContract
      .connect(bobAsSigner)
      .joinDisputePool(2, { value: stakeAmount });

    await disputeContract
      .connect(aliceAsSigner)
      .joinDisputePool(2, { value: stakeAmount });

    expect(finalDecisionContract.mintToken(2, 10, mockUrl)).to.be.revertedWith(
      "Invalid Dispute Id"
    );

    await disputeContract.changeDisputeState(2, 1);
    await disputeContract.assignRandomArbiters(2, [1, 0, 2]);

    expect(finalDecisionContract.mintToken(2, 10, mockUrl)).to.be.revertedWith(
      "Invalid Dispute Id"
    );

    await disputeContract.connect(bobAsSigner).vote(1, 2);
    await disputeContract.connect(alexAsSigner).vote(1, 2);
    await disputeContract.connect(aliceAsSigner).vote(1, 2);

    await disputeContract.changeDisputeState(2, 1);

    expect(finalDecisionContract.mintToken(2, 10, mockUrl)).to.be.revertedWith(
      "Invalid Dispute Id"
    );

    //End Voting Process
    await disputeContract.endVoting(2);

    //Now we can mint token
    await finalDecisionContract.mintToken(2, 10, mockUrl);
  });

  it("should not be able to mint decision NFT more than once", async () => {
    await expect(
      finalDecisionContract.mintToken(2, 10, mockUrl)
    ).to.be.revertedWith("Already Minted!");
  });

  it("should airdrop the NFT to particpating parties", async () => {
    await finalDecisionContract.airDropToken(1, 1, [
      alexAsSigner.address,
      rachelAsSigner.address,
      aliceAsSigner.address,
    ]);

    expect(
      await finalDecisionContract.balanceOf(rachelAsSigner.address, 1)
    ).to.be.eq(ethers.BigNumber.from(1));

    expect(
      await finalDecisionContract.balanceOf(alexAsSigner.address, 1)
    ).to.be.eq(ethers.BigNumber.from(1));

    expect(
      await finalDecisionContract.balanceOf(aliceAsSigner.address, 1)
    ).to.be.eq(ethers.BigNumber.from(1));

    expect(
      await finalDecisionContract.balanceOf(deployerasSigner.address, 1)
    ).to.be.eq(ethers.BigNumber.from(7));
  });

  it("should change ownership,", async () => {
   var res =  await disputeContract.owner();
   console.log(res, "RES");

   
  })
});