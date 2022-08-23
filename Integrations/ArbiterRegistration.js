import { ethers } from "ethers";
import ArbiterReg from "../Integrations/ABIs/ArbiterRegistration.json";

let ArbiterRegistration = "0x5c890248B382d91f8c254a91a380750190A9195a";

async function createArbiterRegistrationContractInstance() {
  const { ethereum } = window;

  //if none is found, it means that a user does not
  if (!ethereum) {
    return;
  }

  //Get wallet provider and signer
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  //contract initialization: create an instance of the contract
  return new ethers.Contract(ArbiterRegistration, ArbiterReg.abi, signer);
}

/// @dev Adds a user to the list of selected or whitelisted arbiters stored within the smart contract.
/// @notice Should mint token to whitelisted user.
/// @dev This function is only callable by the owner/admin of the contract.
/// @dev This function can only be called once per arbiter.
/// @param _addressToWhitelist, the wallet address of the arbiter to be added.

async function addUser(_addressToBeWhiteListed) {
  const contract = await createArbiterRegistrationContractInstance();

  let txn = await contract.addUser(_addressToBeWhiteListed);
  let response = await txn.wait();

  return response;
}

/// @dev Verifies that a user's wallet address is amongst the selected addresses stored in the smart contract.
/// @param _whitelistedAddress, the wallet address of the arbiter to be added.
/// @return a boolean representing the result of the verification

async function verifyUser(_addressToBeWhiteListed) {
  const contract = await createArbiterRegistrationContractInstance();

  let response = await contract.verifyUser(_addressToBeWhiteListed);

  return response;
}

export { addUser, verifyUser };
