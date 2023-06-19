import { ethers } from "hardhat";

async function main() {

  const Factory = await ethers.getContractFactory("Factory");
  const GuessingGame = await ethers.getContractFactory("GuessingGame");

  const guessingGame = await GuessingGame.deploy();
  const factory = await Factory.deploy(guessingGame.address);

  console.log(
    `GuessingGame deployed at ${guessingGame.address}.`
  );
  console.log(
    `Factory deployed at ${factory.address}.`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
