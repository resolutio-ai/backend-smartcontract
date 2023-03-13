// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  //Create an instance of the arbiter smart contract
  const arbiter = await ethers.getContractFactory("ArbiterWhitelister");
  const arbiterContract = await arbiter.deploy();
  await arbiterContract.deployed();
  console.log("arbiterContract deployed to:", arbiterContract.address);

  const disputePool = await hre.ethers.getContractFactory("Disputepool");
  const disputePoolContract = await disputePool.deploy();
  await disputePoolContract.deployed();
  console.log("Dispute pool deployed to:", disputePoolContract.address);

  // const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/{INFURA_API}')
  // const signer = provider.getSigner(SOME_RANDOM_ETH_ADDRESS)
  // const instance = new ethers.Contract(contractAddress, abi, signer)
  // const tx = await instance.transfer(MALICIOUS_ADDRESS, 10000000000000000)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
