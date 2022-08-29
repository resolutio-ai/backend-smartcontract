import { ethers } from "ethers";
import DisputeSystem from "../Integrations/ABIs/DisputePool.json";

let DisputeSystemAddress = "0x5c890248B382d91f8c254a91a380750190A9195a";
let UnInitialized = 0,
  IsCreated = 1,
  ArbiterSelection = 2,
  CanVote = 3,
  ComputeResult = 4,
  End = 5;

async function createDisputeSystemContractInstance() {
  const { ethereum } = window;

  //if none is found, it means that a user does not
  if (!ethereum) {
    return;
  }

  //Get wallet provider and signer
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  //contract initialization: create and return an instance of the contract
  return new ethers.Contract(DisputeSystemAddress, DisputeSystem.abi, signer);
}

async function createDispute(uri) {
  const contract = await createDisputeSystemContractInstance();

  let txn = await contract.createDispute(uri);
  let response = await txn.wait();

  return response;
}

async function getAddressesForDispute() {
  const contract = await createDisputeSystemContractInstance();

  let response = await contract.getAddressesForDispute();
  return response;
}

async function joinDisputePool() {
  const contract = await createDisputeSystemContractInstance();

  let txn = await contract.joinDisputePool(uri);
  let response = await txn.wait();

  return response;
}

async function assignRandomArbiters() {
  const contract = await createDisputeSystemContractInstance();

  let txn = await contract.assignRandomArbiters();
  let response = await txn.wait();

  return response;
}

async function vote(proposal) {
  //Where 1 = validate and 2 = invalidate
  const contract = await createDisputeSystemContractInstance();

  let txn = await contract.vote(proposal);
  let response = await txn.wait();

  return response;
}

async function endVoting() {
  const contract = await createDisputeSystemContractInstance();

  let txn = await contract.endVoting(uri);
  let response = await txn.wait();

  return response;
}

async function getAllDisputes() {
  const contract = await createDisputeSystemContractInstance();

  let response = await contract.getAllDisputes();
  return response;
}

async function getADispute(disputeId) {
  const contract = await createDisputeSystemContractInstance();

  let response = await contract.getDispute(disputeId);
  return response;
}

async function getMyCreatedDisputes(userAddress) {
  const contract = await createDisputeSystemContractInstance();

  let allDisputes = await contract.getAllDisputes();
  let disputeArray = [];

  for (let dispute of allDisputes) {
    if (dispute.creator == userAddress) {
      disputeArray.push(dispute);
    }
  }

  return disputeArray;
}

async function getMyArbiterDisputes(userAddress) {
  const contract = await createDisputeSystemContractInstance();

  let allDisputes = await contract.getAllDisputes();
  let disputeArray = [];

  for (let dispute of allDisputes) {
    if (dispute.selectedArbiters.includes(userAddress)) {
      disputeArray.push(dispute);
    }
  }
  return disputeArray;
}

async function getNewDisputes() {
  const contract = await createDisputeSystemContractInstance();

  let allDisputes = await contract.getAllDisputes();
  let disputeArray = [];

  for (let dispute of allDisputes) {
    if (dispute.state == IsCreated) {
      disputeArray.push(dispute);
    }
  }

  return disputeArray;
}

async function getOngoingDisputes(disputeId) {
  const contract = await createDisputeSystemContractInstance();

  let allDisputes = await contract.getAllDisputes();
  let disputeArray = [];

  for (let dispute of allDisputes) {
    if (
      dispute.state == ArbiterSelection ||
      dispute.state == CanVote ||
      dispute.state == ComputeResult
    ) {
      disputeArray.push(dispute);
    }
  }

  return disputeArray;
}

async function getResolvedDisputes(disputeId) {
  const contract = await createDisputeSystemContractInstance();

  let allDisputes = await contract.getAllDisputes();
  let disputeArray = [];

  for (let dispute of allDisputes) {
    if (dispute.state == End) {
      disputeArray.push(dispute);
    }
  }

  return disputeArray;
}

export {
  createDispute,
  getAddressesForDispute,
  joinDisputePool,
  assignRandomArbiters,
  vote,
  endVoting,
  getResolvedDisputes,
  getAllDisputes,
  getADispute,
  getOngoingDisputes,
  getNewDisputes,
  getMyArbiterDisputes,
  getMyCreatedDisputes,
};