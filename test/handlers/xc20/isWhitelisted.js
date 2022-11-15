/**
 * Copyright 2020 ChainSafe Systems
 * SPDX-License-Identifier: LGPL-3.0-only
 */

const TruffleAssert = require('truffle-assertions');
const Ethers = require('ethers');

const Helpers = require('../../helpers');

const ERC20MintableContract = artifacts.require("ERC20PresetMinterPauser");
const XC20HandlerContract = artifacts.require("XC20Handler");

contract('XC20Handler - [isWhitelisted]', async (accounts) => {
    const AbiCoder = new Ethers.utils.AbiCoder();

    const domainID = 1;

    let BridgeInstance;
    let ERC20MintableInstance1;
    let ERC20MintableInstance2;
    let initialResourceIDs;
    let initialContractAddresses;
    let burnableContractAddresses;

    beforeEach(async () => {
        await Promise.all([
            BridgeInstance = await Helpers.deployBridge(domainID, accounts[0]),
            ERC20MintableContract.new("token", "TOK").then(instance => ERC20MintableInstance1 = instance),
            ERC20MintableContract.new("token", "TOK").then(instance => ERC20MintableInstance2 = instance)
        ])

        initialResourceIDs = [];
        resourceID1 = Ethers.utils.hexZeroPad((ERC20MintableInstance1.address + Ethers.utils.hexlify(domainID).substr(2)), 32);
        initialResourceIDs.push(resourceID1);
        initialContractAddresses = [ERC20MintableInstance1.address];
        burnableContractAddresses = [];
    });

    it('[sanity] contract should be deployed successfully', async () => {
        await TruffleAssert.passes(XC20HandlerContract.new(BridgeInstance.address));
    });

    it('initialContractAddress should be whitelisted', async () => {
        const XC20HandlerInstance = await XC20HandlerContract.new(BridgeInstance.address);
        await BridgeInstance.adminSetResource(XC20HandlerInstance.address, resourceID1, ERC20MintableInstance1.address);
        const isWhitelisted = await XC20HandlerInstance._contractWhitelist.call(ERC20MintableInstance1.address);
        assert.isTrue(isWhitelisted, "Contract wasn't successfully whitelisted");
    });


    // as we are working with a mandatory whitelist, these tests are currently not necessary

    // it('initialContractAddress should not be whitelisted', async () => {
    //     const XC20HandlerInstance = await XC20HandlerContract.new(BridgeInstance.address, initialResourceIDs, initialContractAddresses);
    //     const isWhitelisted = await XC20HandlerInstance._contractWhitelist.call(ERC20MintableInstance1.address);
    //     assert.isFalse(isWhitelisted, "Contract should not have been whitelisted");
    // });

    // it('ERC20MintableInstance2.address should not be whitelisted', async () => {
    //     const XC20HandlerInstance = await XC20HandlerContract.new(BridgeInstance.address, initialResourceIDs, initialContractAddresses);
    //     const isWhitelisted = await XC20HandlerInstance._contractWhitelist.call(ERC20MintableInstance2.address);
    //     assert.isFalse(isWhitelisted, "Contract should not have been whitelisted");
    // });
});
