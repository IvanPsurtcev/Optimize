import {ethers, network} from "hardhat"
import {Signer, Contract, ContractFactory, BigNumber} from "ethers"
import chai from "chai"
import type {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers"
import {
    Token,
    Token__factory,
    MockERC20,
    MockERC20__factory
} from "../typechain-types";

const {expect} = chai

function ether(eth: string) {
    let weiAmount = ethers.utils.parseEther(eth)
    return weiAmount;
}


describe("NFTBox", async function () {
    let owner: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let Token: Token__factory;
    let token: Token;
    let MockERC20: MockERC20__factory;
    let mockERC20: MockERC20;

    beforeEach("Deploy contract", async function () {
        [owner, user1, user2] = await ethers.getSigners();
        Token = new Token__factory(owner);
        token = await Token.deploy();
        await token.deployed();

        MockERC20 = new MockERC20__factory(owner);

        mockERC20 = await MockERC20.deploy(10 ** 9);
        await mockERC20.deployed();

        expect(await token.getOwner()).to.equal(owner.address)
        expect(await mockERC20.approve(token.address, ether("1"))).to.ok;
    });  

    describe("functions", async function() {
        it("set owner", async function () {
            await expect(token.connect(user1).setOwner(user2.address)).to.be.revertedWith("Caller is not owner");
            expect(await token.setOwner(user1.address)).to.ok
            expect(await token.getOwner()).to.equal(user1.address)
        });

        it("changeWhiteList & proxyToken", async function () {
            await expect(token.connect(user1).changeWhiteList([user2.address, user1.address], [1, 1])).to.be.revertedWith("Caller is not owner");
            await expect(token.changeWhiteList([user2.address, user1.address], [1, 1, 0])).to.be.revertedWith("Other array size");
            expect(await token.changeWhiteList([user2.address, user1.address], [1, 1])).to.ok;
            await expect(token.changeWhiteList([user2.address, user1.address], [1, 1, 0])).to.be.revertedWith("Other array size");

            await expect(token.proxyToken(mockERC20.address, owner.address, ether("1"), {value: ether("0.1")})).to.be.revertedWith("Not WhiteList");
            expect(await token.proxyToken(mockERC20.address, user1.address, ether("1"), {value: ether("0.1")})).to.ok
                .to.emit(token, 'ProxyDeposit')
                .withArgs(mockERC20.address, owner.address, user1.address, ether("1"));
            expect(await mockERC20.balanceOf(user1.address)).to.equal(ether("1"));
        });
    });
});