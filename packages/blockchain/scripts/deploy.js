const hre = require("hardhat");

async function main() {

  const nswap = await hre.ethers.deployContract("NSwap");

  await nswap.waitForDeployment();

  console.log(
    `Deployed to ${nswap.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
