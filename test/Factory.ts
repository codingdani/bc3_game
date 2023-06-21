import { expect } from "chai";
import { ethers } from "hardhat";

describe("Factory", () => {


    async function deployFixture() {
        const GuessingGame = await ethers.getContractFactory("GuessingGame");
        const guessingGame = await GuessingGame.deploy();

        const Factory = await ethers.getContractFactory("Factory");
        const factory = await Factory.deploy(guessingGame.address);
        const accounts = await ethers.getSigners();

        // account0
        await factory.createGame(0, 100, 3, ethers.utils.parseEther("0.1"));
        await factory.createGame(0, 500, 4, ethers.utils.parseEther("0.1"));
        await factory.createGame(0, 1000, 5, ethers.utils.parseEther("0.1"));

        //account1
        await factory.connect(accounts[1]).createGame(0, 100, 3, ethers.utils.parseEther("0.1"));
        await factory.connect(accounts[1]).createGame(0, 100, 3, ethers.utils.parseEther("0.1"));
        await factory.connect(accounts[1]).createGame(0, 100, 3, ethers.utils.parseEther("0.1"));
        await factory.connect(accounts[1]).createGame(0, 100, 3, ethers.utils.parseEther("0.1"));

        //account2
        await factory.connect(accounts[2]).createGame(0, 100, 3, ethers.utils.parseEther("0.1"));
        await factory.connect(accounts[2]).createGame(0, 100, 3, ethers.utils.parseEther("0.1"));
        await factory.connect(accounts[2]).createGame(0, 100, 3, ethers.utils.parseEther("0.1"));

        //account3
        await factory.connect(accounts[3]).createGame(0, 100, 3, ethers.utils.parseEther("0.1"));
        await factory.connect(accounts[3]).createGame(0, 100, 3, ethers.utils.parseEther("0.1"));

        return { factory, accounts }
    }

    describe("createGame", () => {
        it("should not create a game with wrong values", async () => {
            const { factory, accounts } = await deployFixture();
            await expect(factory.connect(accounts[2]).createGame(100, 0, 3, ethers.utils.parseEther("0.1"))).to.be.revertedWith("Max guess must be greater than min guess.");
            expect((await factory.getMasterGameList(accounts[3].address)).length).to.be.equal(2);

        })
    })



    describe("getMasters", () => {
        it("should return the right amount of masters", async () => {
            const { factory } = await deployFixture();
            expect((await factory.getMasters()).length).to.be.equal(4);
        })
    })

    describe("getMastersGameList", () => {
        it("should return the correct amount of games of each master ", async () => {
            const { factory, accounts } = await deployFixture();
            expect((await factory.getMasterGameList(accounts[0].address)).length).to.be.equal(3);
            expect((await factory.getMasterGameList(accounts[1].address)).length).to.be.equal(4);
            expect((await factory.getMasterGameList(accounts[2].address)).length).to.be.equal(3);
            expect((await factory.getMasterGameList(accounts[3].address)).length).to.be.equal(2);
        })
    })

    describe("getGameActivity", () => {
        it("should return a active game", async () => {
            const { factory, accounts } = await deployFixture();
            const contractAddress = (await factory.getMasterGameList(accounts[0].address))[1];
            expect(await factory.getGameActivity(accounts[0].address, contractAddress)).to.be.equal(true);
        })
    })
    describe("deactivateGame", () => {
        it("should successfully deactivate an contract", async () => {
            const { factory, accounts } = await deployFixture();
            const contractAddress = (await factory.getMasterGameList(accounts[0].address))[1];
            await factory.deactivateGame(accounts[0].address, contractAddress);
            expect(await factory.getGameActivity(accounts[0].address, contractAddress)).to.be.equal(false);
        })
    })
    describe("getAllActiveGames", async () => {
        it("should give the correct amount and contract addresses from a given master", async () => {
            const { factory, accounts } = await deployFixture();
            const contractList = await factory.getMasterGameList(accounts[1].address);
            await factory.connect(accounts[1]).deactivateGame(accounts[1].address, contractList[0]);
            await factory.connect(accounts[1]).deactivateGame(accounts[1].address, contractList[2]);
            expect((await factory.getAllActiveGames(accounts[1].address)).length).to.be.equal(2);
            expect((await factory.getAllActiveGames(accounts[1].address))[0]).to.be.equal(contractList[1]);
            expect((await factory.getAllActiveGames(accounts[1].address))[1]).to.be.equal(contractList[3]);
        })
    })

})