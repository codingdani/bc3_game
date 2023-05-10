import { expect } from "chai";
import { ethers } from "hardhat";

describe("Factory", () => {


    async function deployFixture() {
        const GuessingGame = await ethers.getContractFactory("GuessingGame");
        const guessingGame = await GuessingGame.deploy();

        const Factory = await ethers.getContractFactory("Factory");
        const factory = await Factory.deploy(guessingGame.address);
        const accounts = await ethers.getSigners();
        return { factory, accounts }
    }

    describe("create children", () => {
        it("should create and push a game instance to array", async () => {
            const { factory, accounts } = await deployFixture();
            await factory.createGame(0, 1000, 5, ethers.utils.parseEther("0.1"));
            expect(await factory.children(0)).to.not.be.empty;
        })

        it("should set the right owner to the child contract", async () => {
            const { factory, accounts } = await deployFixture();
            await factory.connect(accounts[1]).createGame(0, 1000, 5, ethers.utils.parseEther("0.1"));
            const childAddress = await factory.children(0);
            const guessingGame = await ethers.getContractAt("GuessingGame", childAddress);
            expect(await guessingGame.owner()).to.be.equal(accounts[1].address);



        })
    })

})