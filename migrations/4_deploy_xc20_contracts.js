// The Licensed Work is (c) 2022 Sygma
// SPDX-License-Identifier: LGPL-3.0-only

const Utils = require("./utils");

const BridgeContract = artifacts.require("Bridge");
const XC20HandlerContract = artifacts.require("XC20Handler");
const FeeRouterContract = artifacts.require("FeeHandlerRouter");
const BasicFeeHandlerContract = artifacts.require("BasicFeeHandler");
const DynamicFeeHandlerContract = artifacts.require("DynamicERC20FeeHandlerEVM");
const PercentageFeeHandler = artifacts.require("PercentageERC20FeeHandlerEVM");


module.exports = async function (deployer, network) {
  // trim suffix from network name and fetch current network config
  const currentNetworkName = network.split("-")[0];
  if (
    currentNetworkName !== "astar" ||
    currentNetworkName !== "shiden" ||
    currentNetworkName !== "shibuya"
  ) {
    return;
  }

  const networksConfig = Utils.getNetworksConfig();
  const currentNetworkConfig = networksConfig[currentNetworkName];

  // fetch deployed contracts addresses
  const bridgeInstance = await BridgeContract.deployed();
  const feeRouterInstance = await FeeRouterContract.deployed();
  const basicFeeHandlerInstance = await BasicFeeHandlerContract.deployed();
  const dynamicFeeHandlerInstance =
    await DynamicFeeHandlerContract.deployed();
  const percentageFeeHandlerInstance = await PercentageFeeHandler.deployed();

  // deploy XC20 contracts
  await deployer.deploy(XC20HandlerContract, bridgeInstance.address);
  const xc20HandlerInstance = await XC20HandlerContract.deployed();

  // setup xc20 tokens
  for (const xc20 of currentNetworkConfig.xc20) {
    await Utils.setupErc20(deployer, xc20, bridgeInstance, xc20HandlerInstance);
    await Utils.setupFee(
      networksConfig,
      feeRouterInstance,
      dynamicFeeHandlerInstance,
      basicFeeHandlerInstance,
      percentageFeeHandlerInstance,
      xc20
    );

    console.log(
      "-------------------------------------------------------------------------------"
    );
    console.log("XC20 address:", "\t", xc20.address);
    console.log("ResourceID:", "\t", xc20.resourceID);
    console.log(
      "-------------------------------------------------------------------------------"
    );
  }

  console.log(
    "XC20Handler contract address:",
    "\t",
    xc20HandlerInstance.address
  );
};
