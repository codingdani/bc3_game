import { expect } from "chai";
import { ethers } from "hardhat";

describe("GuessingGame", () => {
    async function deployFixture() {
        const GuessingGame = await ethers.getContractFactory("GuessingGame");
        const accounts = await ethers.getSigners();
        const minGuess = 0;
        const maxGuess = 100;
        const minPlayers = 5;
        const entryFee = ethers.utils.parseUnits("0.1", "ether"); // 0.1 eth
        const guessingGame = await GuessingGame.deploy();
        // const guessingGame = await GuessingGame.deploy(minGuess, maxGuess, minPlayers, entryFee);
        await guessingGame.init(minGuess, maxGuess, minPlayers, entryFee, accounts[0].address);
        return { accounts, guessingGame };
    }

    describe("Enter Guess", () => {
        it("should reject when player enter with not enough entry fee", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await expect(guessingGame.connect(accounts[1]).enterGuess(50, { value: ethers.utils.parseUnits("0.01") })).to.be.revertedWith("Insufficient entry fee.");
        })
        it("should reject when player enter with an invalid guess", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await expect(guessingGame.connect(accounts[1]).enterGuess(200, { value: ethers.utils.parseUnits("0.1") })).to.be.revertedWith("Check your input value.");
        })
        it("should reject when player tries to enter multiple times ", async () => {
            const { accounts, guessingGame } = await deployFixture();
            //enter first time
            await guessingGame.connect(accounts[1]).enterGuess(50, { value: ethers.utils.parseUnits("0.1") });
            //enter second time
            await expect(guessingGame.connect(accounts[1]).enterGuess(40, { value: ethers.utils.parseUnits("0.1") })).to.be.revertedWith("You have already entered a guess.");
        })

        it("should add a player into the players array", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await guessingGame.connect(accounts[1]).enterGuess(50, { value: ethers.utils.parseUnits("0.1") });
            expect(await guessingGame.players(0)).to.equal(accounts[1].address);
        })
        it("should reject any ether if not enter", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await expect(accounts[1].sendTransaction(
                {
                    gasLimit: 300000,
                    to: guessingGame.address,
                    value: ethers.utils.parseEther("0.1")
                }
            )).to.be.revertedWith("This contract does not accept Ether, if you don't participate in the Game.");
        })
    })

    describe("Contract information", () => {

        it("should not be initialized the game two times", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await expect(guessingGame.init(0, 200, 10, 5, accounts[0].address)).to.be.revertedWith("The game has already been initialized");
        })


        it("should return the amount of players participating in this game", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await guessingGame.connect(accounts[1]).enterGuess(30, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[0]).enterGuess(40, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).enterGuess(70, { value: ethers.utils.parseUnits("0.1") });
            expect(await guessingGame.getPlayerCount()).to.equal(3);
        })

        it("should return the guess of the contract caller", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await guessingGame.connect(accounts[1]).enterGuess(30, { value: ethers.utils.parseUnits("0.1") });
            expect(await guessingGame.connect(accounts[1]).getMyGuess()).to.equal(30);
        })

        it("should not increase the size of players length even when a non-player calls the getMyGuess", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await guessingGame.connect(accounts[1]).enterGuess(30, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).getMyGuess();
            expect(await guessingGame.connect(accounts[1]).getPlayerCount()).to.equal(1);
        })
        it("should print the right owner", async () => {
            const { accounts, guessingGame } = await deployFixture();
            expect(await guessingGame.owner()).to.equal(accounts[0].address);
        })
        it("should show the rules", async () => {
            const { accounts, guessingGame } = await deployFixture();
            expect((await guessingGame.RULES()).minGuess).to.equal(0);
            expect((await guessingGame.RULES()).maxGuess).to.equal(100);
            expect((await guessingGame.RULES()).minPlayers).to.equal(5);
            expect((await guessingGame.RULES()).entryFee).to.equal(ethers.utils.parseEther("0.1"));

        })
    })

    describe("Start game", () => {
        it("should reject when not enough players enter the game", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await expect(guessingGame.startGame()).to.be.revertedWith("Not enough players.");
        })
        it("should reject when not the owner tries to start the game", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await expect(guessingGame.connect(accounts[1]).startGame()).to.be.revertedWith("only the owner can use this function.");
        })

        it("should print the right outcome values and select winner", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await guessingGame.connect(accounts[1]).enterGuess(20, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).enterGuess(30, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).enterGuess(50, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).enterGuess(67, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).enterGuess(5, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.startGame();

            expect((await guessingGame.outcome()).sum).to.be.equal(172);
            expect((await guessingGame.outcome()).target).to.be.equal(22);
            expect((await guessingGame.winner())).to.be.equal(accounts[1].address);

        })

        it("should select the right winner if tie", async () => {

            const { accounts, guessingGame } = await deployFixture();
            await guessingGame.connect(accounts[1]).enterGuess(70, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).enterGuess(2, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).enterGuess(90, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).enterGuess(2, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).enterGuess(96, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[6]).enterGuess(70, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[7]).enterGuess(2, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[9]).enterGuess(2, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[10]).enterGuess(96, { value: ethers.utils.parseUnits("0.1") });


            await guessingGame.startGame();
            const key = (await guessingGame.outcome()).key;
            const possibleWinners = await guessingGame.outcomePossibleWinners(key);
            const randomNumber = BigInt((await guessingGame.outcome()).randomNumber.toString());
            const index = Number(randomNumber % BigInt(4));

            const winner = possibleWinners[index];

            expect(await guessingGame.winner()).to.be.equal(winner);

        })
    })

})
