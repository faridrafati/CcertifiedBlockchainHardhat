//npx hardhat run --network localhost scripts/deploy-script.js
const fs = require("fs");
const hardhat = require("hardhat");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
};

async function main() {
  await deployContractWithArgs("Adoption",[]);
  await deployContractWithArgs("Auction",[]);
  await deployContractWithArgs("Certificate",[]);
  await deployContractWithArgs("CryptoDoggies",[]);
  await deployContractWithArgs(
    "ChatBoxPlus",
    ["0x4661726964205261666174690000000000000000000000000000000000000000"]
  );



  await deployContractWithArgs("Email",[]);
  await deployContractWithArgs("GuessingGame",[]);
  await deployContractWithArgs("Poll",[]);
  await deployContractWithArgs("Task",[]);
  const occasions = [
    {
      name: "UFC Miami",
      cost: tokens(3),
      tickets: 0,
      date: "May 31",
      time: "6:00PM EST",
      location: "Miami-Dade Arena - Miami, FL",
    },
    {
      name: "ETH Tokyo",
      cost: tokens(1),
      tickets: 125,
      date: "Jun 2",
      time: "1:00PM JST",
      location: "Tokyo, Japan",
    },
    {
      name: "ETH Privacy Hackathon",
      cost: tokens(0.25),
      tickets: 200,
      date: "Jun 9",
      time: "10:00AM TRT",
      location: "Turkey, Istanbul",
    },
    {
      name: "Dallas Mavericks vs. San Antonio Spurs",
      cost: tokens(5),
      tickets: 0,
      date: "Jun 11",
      time: "2:30PM CST",
      location: "American Airlines Center - Dallas, TX",
    },
    {
      name: "ETH Global Toronto",
      cost: tokens(1.5),
      tickets: 125,
      date: "Jun 23",
      time: "11:00AM EST",
      location: "Toronto, Canada",
    },
  ];
  const contract = await deployContractWithArgs("TicketSale", [
    "TicketSale",
    "TS"
  ]);
  await deployInitialValues(contract, ["list"], occasions);

  await deployContractWithArgs("Voting", [
    "0x5F873c07ED0A2668b9F36cE6F162f0E24a6a153f",
    "0x350E98bEa1Cdbc5189F443E13D8ef4324e392B53",
  ]);
  await deployContractWithArgs("WeightedVoting", ["Ebi", "SiSi", "Esi"]);
  const DappToken = await deployContractWithArgs(
    "DappToken",
    ["AmirToken",
    "AMT",
    0,
    21000000]
  );

  await deployContractWithArgs("DappTokenSale", [DappToken,1e12]);

}

main();



async function deployContractWithArgs(contractName, arg) {
  const Contract = await hardhat.ethers.getContractFactory(contractName);
  let contract;
  try {
    contract = await Contract.deploy(arg);
  } catch (error) {
    contract = await Contract.deploy(...arg);
  }


  await contract.waitForDeployment();

  const address = `export const ${contractName.toUpperCase()}_ADDRESS = "${
    contract.target
  }";`;
  const parsed = JSON.parse(
    fs.readFileSync(
      `../hardHat/artifacts/contracts/${contractName}.sol/${contractName}.json`,
      "utf8"
    )
  );

  const abi =
    `export const ${contractName.toUpperCase()}_ABI = ` +
    JSON.stringify(parsed.abi);
  fs.writeFileSync(
    `../src/components/config/${contractName}Config.js`,
    address + "\n" + abi
  );
  console.log(contractName, ": ", contract.target);
  return contract;
}

async function deployInitialValues(contract, functions, initialValues) {
  const [deployer] = await ethers.getSigners();

  let matrixItems = [];
  const keyNames = Object.keys(initialValues[0]);
  const numRows = initialValues.length;
  const numCols = keyNames.length;
  for (let i = 0; i < numRows; i++) {
    matrixItems[i] = [];
    for (let j = 0; j < numCols; j++) {
      matrixItems[i][j] = initialValues[i][keyNames[j]];
    }
  }

  for (let i = 0; i < initialValues.length; i++) {
    const transaction = await contract
      .connect(deployer)
      [functions](...matrixItems[i]);
    await transaction.wait();
    console.log(`   Listed Event ${i + 1}: ${initialValues[i].name}`);
  }
}

