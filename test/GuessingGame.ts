import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

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

    function calculateHash(guess: Number, salt: Number) {
        const hash = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [guess, salt])
        );
        return hash
    }

    describe("startRevealPhase", () => {
        it("should revert if commit time is not over", async () => {
            const { accounts, guessingGame } = await deployFixture();
            time.increase(5000);
            await expect(guessingGame.startRevealPhase()).to.be.revertedWith("You can only start if the commit deadline is over and you're passed your own deadline");
        })

        it("should revert if commit time is over and not enough players", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await time.increase(90000);
            await expect(guessingGame.startRevealPhase()).to.be.revertedWith("You can only start if there is enough players");
        })
        it("should working after player enters and commit time is over", async () => {
            const { accounts, guessingGame } = await deployFixture();
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("50"));
            await guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[6]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await time.increase(90000);
            await guessingGame.startRevealPhase()
        })

        it("should revert if startRevealPhase two times", async () => {
            const { accounts, guessingGame } = await deployFixture();
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("50"));
            await guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[6]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await time.increase(90000);
            await guessingGame.startRevealPhase()
            await expect(guessingGame.startRevealPhase()).to.be.revertedWith("You can only start once");
        })



        it("should revert if it's in Revealphase", async () => {
            const { accounts, guessingGame } = await deployFixture();
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("50"));
            await guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[6]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await time.increase(180000);
            await expect(guessingGame.startRevealPhase()).to.be.revertedWith("You can only start if the commit deadline is over and you're passed your own deadline");
        })

    })

    describe("commit Hash", () => {
        it("should reject when player entered already", async () => {
            const { accounts, guessingGame } = await deployFixture();
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("50"));
            guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await expect(guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") })).to.be.revertedWith("You have already entered a guess.");
        })
        it("should reject when player enter with not enough entry fee", async () => {
            const { accounts, guessingGame } = await deployFixture();
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("50"));
            await expect(guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.01") })).to.be.revertedWith("Insufficient entry fee.");
        })
        it("should revert if the commitTime is over", async () => {
            const { accounts, guessingGame } = await deployFixture();
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("50"));
            await time.increase(90000)
            guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await expect(guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") })).to.be.revertedWith("The commit deadline is over.");
        })
    })


    describe("withdraw", () => {
        it("should revert if commit time hasnt passed", async () => {
            const { accounts, guessingGame } = await deployFixture();
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("50"));
            await guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await expect(guessingGame.connect(accounts[1]).withdraw()).to.be.revertedWith("You cannot withdraw.");
        })
        it("should possible to withdraw if the game master didn't start game", async () => {
            const { accounts, guessingGame } = await deployFixture();
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("50"));
            await guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await time.increase(90000);
            await expect(guessingGame.connect(accounts[1]).withdraw()).to.be.revertedWith("You cannot withdraw.");
            await time.increase(90000);
            await expect(guessingGame.connect(accounts[1]).withdraw()).to.not.be.reverted;

        })
        it("should withdraw if commit time is over but too less player", async () => {
            const { accounts, guessingGame } = await deployFixture();
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("50"));
            await guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") })
            await time.increase(90000);
            await expect(guessingGame.connect(accounts[1]).withdraw()).to.not.be.reverted;

        })

        it("should withdraw the right amount and show right balance", async () => {
            const { accounts, guessingGame } = await deployFixture();
            const entryFee = (await guessingGame.RULES()).entryFee;
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("50"));
            await guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") })
            await guessingGame.connect(accounts[2]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") })
            const contractBalance = await ethers.provider.getBalance(guessingGame.address);
            await time.increase(90000);
            await guessingGame.connect(accounts[1]).withdraw();
            const updatedContractBalance = await ethers.provider.getBalance(guessingGame.address);
            expect(updatedContractBalance).to.be.equal(contractBalance.sub(entryFee));
        })

        it("should not withdraw twice", async () => {
            const { accounts, guessingGame } = await deployFixture();
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("50"));
            await guessingGame.connect(accounts[1]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(hash, { value: ethers.utils.parseUnits("0.1") });
            await time.increase(90000);
            await expect(guessingGame.connect(accounts[1]).withdraw()).to.not.be.reverted;
            await expect(guessingGame.connect(accounts[1]).withdraw()).to.be.revertedWith("You already withdrawed.");
        })
    })


    describe("reveal", async () => {

        it("should work if game continue as intended", async () => {
            const { accounts, guessingGame } = await deployFixture();
            //commit
            await guessingGame.connect(accounts[1]).commitHash(calculateHash(25, 123), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(calculateHash(30, 467), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(calculateHash(41, 248), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(calculateHash(56, 242), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(calculateHash(89, 986), { value: ethers.utils.parseUnits("0.1") });
            // past commit time
            await time.increase(90000);
            // past some time
            await time.increase(30000);
            // start the game
            await guessingGame.startRevealPhase();
            await expect(guessingGame.connect(accounts[1]).reveal(25, 123)).to.not.be.reverted;
        })
        it("should reject if player tries to reveal multiple times", async () => {
            const { accounts, guessingGame } = await deployFixture();
            //commit
            await guessingGame.connect(accounts[1]).commitHash(calculateHash(25, 123), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(calculateHash(30, 467), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(calculateHash(41, 248), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(calculateHash(56, 242), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(calculateHash(89, 986), { value: ethers.utils.parseUnits("0.1") });
            await time.increase(90000);
            // past some time
            await time.increase(30000);
            // start the game
            await guessingGame.startRevealPhase();
            await expect(guessingGame.connect(accounts[1]).reveal(25, 123)).to.not.be.reverted;
            await expect(guessingGame.connect(accounts[1]).reveal(25, 123)).to.be.revertedWith("Guess was already revealed.");
        })
        it("should revert if an unknown player tries to reveal", async () => {
            const { accounts, guessingGame } = await deployFixture();
            //commit
            await guessingGame.connect(accounts[1]).commitHash(calculateHash(25, 123), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(calculateHash(30, 467), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(calculateHash(41, 248), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(calculateHash(56, 242), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(calculateHash(89, 986), { value: ethers.utils.parseUnits("0.1") });
            await time.increase(90000);
            // past some time
            await time.increase(30000);
            // start the game
            await guessingGame.startRevealPhase();
            //await guessingGame.connect(accounts[6]).reveal(25, 123)
            await expect(guessingGame.connect(accounts[6]).reveal(25, 123)).to.be.revertedWith("There is no commit to be revealed.");
        })
        it("should revert if player tries to lie", async () => {
            const { accounts, guessingGame } = await deployFixture();
            //commit
            await guessingGame.connect(accounts[1]).commitHash(calculateHash(25, 123), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(calculateHash(30, 467), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(calculateHash(41, 248), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(calculateHash(56, 242), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(calculateHash(89, 986), { value: ethers.utils.parseUnits("0.1") });
            await time.increase(90000);
            // past some time
            await time.increase(30000);
            // start the game
            await guessingGame.startRevealPhase();
            await expect(guessingGame.connect(accounts[1]).reveal(55, 123)).to.be.revertedWith("You enter wrong guess or salt");
        })
        it("should revert if player doesn't answer during reveal time", async () => {
            const { accounts, guessingGame } = await deployFixture();
            //commit
            await guessingGame.connect(accounts[1]).commitHash(calculateHash(25, 123), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(calculateHash(30, 467), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(calculateHash(41, 248), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(calculateHash(56, 242), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(calculateHash(89, 986), { value: ethers.utils.parseUnits("0.1") });
            await time.increase(90000);
            // past some time3
            await guessingGame.startRevealPhase();
            await time.increase(90000);
            // start the game
            await expect(guessingGame.connect(accounts[1]).reveal(25, 123)).to.be.revertedWith("The reveal time is over.");

        })
        it("should revert if its not time to reveal", async () => {

            const { accounts, guessingGame } = await deployFixture();
            //commit
            await guessingGame.connect(accounts[1]).commitHash(calculateHash(25, 123), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(calculateHash(30, 467), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(calculateHash(41, 248), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(calculateHash(56, 242), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(calculateHash(89, 986), { value: ethers.utils.parseUnits("0.1") });

            await expect(guessingGame.connect(accounts[1]).reveal(25, 123)).to.be.revertedWith("It's not the time to reveal yet.");

        })


    })

    describe("finishGame", () => {
        it("should select the right winner", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await guessingGame.connect(accounts[1]).commitHash(calculateHash(20, 123), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(calculateHash(30, 467), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(calculateHash(50, 248), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(calculateHash(67, 242), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(calculateHash(5, 986), { value: ethers.utils.parseUnits("0.1") });
            //end commit phase
            await time.increase(90000);

            // we are in stargamePhase
            await guessingGame.startRevealPhase();

            // we are in revealhase now
            await guessingGame.connect(accounts[1]).reveal(20, 123)
            await guessingGame.connect(accounts[2]).reveal(30, 467)
            await guessingGame.connect(accounts[3]).reveal(50, 248)
            await guessingGame.connect(accounts[4]).reveal(67, 242)
            await guessingGame.connect(accounts[5]).reveal(5, 986)

            //end revealphase
            await time.increase(90000);

            await guessingGame.finishGame();
            expect((await guessingGame.winner())).to.be.equal(accounts[1].address);
        })
        it("should select the right winner even if some do not reveal", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await guessingGame.connect(accounts[1]).commitHash(calculateHash(20, 123), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(calculateHash(50, 467), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(calculateHash(30, 248), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(calculateHash(67, 242), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(calculateHash(5, 986), { value: ethers.utils.parseUnits("0.1") });
            //end commit phase
            await time.increase(90000);

            // we are in stargamePhase
            await guessingGame.startRevealPhase();

            // we are in revealhase now
            await guessingGame.connect(accounts[2]).reveal(50, 467)
            await guessingGame.connect(accounts[3]).reveal(30, 248)

            //end revealphase
            await time.increase(90000);

            await guessingGame.finishGame();
            expect((await guessingGame.winner())).to.be.equal(accounts[3].address);
        })
        it("cannot execute twice", async () => {
            const { accounts, guessingGame } = await deployFixture();
            await guessingGame.connect(accounts[1]).commitHash(calculateHash(20, 123), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[2]).commitHash(calculateHash(50, 467), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[3]).commitHash(calculateHash(30, 248), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[4]).commitHash(calculateHash(67, 242), { value: ethers.utils.parseUnits("0.1") });
            await guessingGame.connect(accounts[5]).commitHash(calculateHash(5, 986), { value: ethers.utils.parseUnits("0.1") });
            //end commit phase
            await time.increase(90000);

            // we are in stargamePhase
            await guessingGame.startRevealPhase();

            // we are in revealhase now
            await guessingGame.connect(accounts[2]).reveal(50, 467)
            await guessingGame.connect(accounts[3]).reveal(30, 248)

            //end revealphase
            await time.increase(90000);

            await guessingGame.finishGame();
            expect((await guessingGame.winner())).to.be.equal(accounts[3].address);
            expect(await guessingGame.finishGame).to.be.revertedWith("Game already started");
        })
    })

    //     describe("Enter Guess", () => {
    //         it("should reject when player enter with not enough entry fee", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await expect(guessingGame.connect(accounts[1]).enterGuess(50, { value: ethers.utils.parseUnits("0.01") })).to.be.revertedWith("Insufficient entry fee.");
    //         })
    //         it("should reject when player enter with an invalid guess", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await expect(guessingGame.connect(accounts[1]).enterGuess(200, { value: ethers.utils.parseUnits("0.1") })).to.be.revertedWith("Check your input value.");
    //         })
    //         it("should reject when player tries to enter multiple times ", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             //enter first time
    //             await guessingGame.connect(accounts[1]).enterGuess(50, { value: ethers.utils.parseUnits("0.1") });
    //             //enter second time
    //             await expect(guessingGame.connect(accounts[1]).enterGuess(40, { value: ethers.utils.parseUnits("0.1") })).to.be.revertedWith("You have already entered a guess.");
    //         })

    //         it("should add a player into the players array", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await guessingGame.connect(accounts[1]).enterGuess(50, { value: ethers.utils.parseUnits("0.1") });
    //             expect(await guessingGame.players(0)).to.equal(accounts[1].address);
    //         })
    //         it("should reject any ether if not enter", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await expect(accounts[1].sendTransaction(
    //                 {
    //                     gasLimit: 300000,
    //                     to: guessingGame.address,
    //                     value: ethers.utils.parseEther("0.1")
    //                 }
    //             )).to.be.revertedWith("This contract does not accept Ether, if you don't participate in the Game.");
    //         })
    //     })






    //     describe("Contract information", () => {

    //         it("should not be initialized the game two times", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await expect(guessingGame.init(0, 200, 10, 5, accounts[0].address)).to.be.revertedWith("The game has already been initialized");
    //         })


    //         it("should return the amount of players participating in this game", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await guessingGame.connect(accounts[1]).enterGuess(30, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[0]).enterGuess(40, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[2]).enterGuess(70, { value: ethers.utils.parseUnits("0.1") });
    //             expect(await guessingGame.getPlayerCount()).to.equal(3);
    //         })

    //         it("should return the guess of the contract caller", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await guessingGame.connect(accounts[1]).enterGuess(30, { value: ethers.utils.parseUnits("0.1") });
    //             expect(await guessingGame.connect(accounts[1]).getMyGuess()).to.equal(30);
    //         })

    //         it("should not increase the size of players length even when a non-player calls the getMyGuess", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await guessingGame.connect(accounts[1]).enterGuess(30, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[2]).getMyGuess();
    //             expect(await guessingGame.connect(accounts[1]).getPlayerCount()).to.equal(1);
    //         })
    //         it("should print the right owner", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             expect(await guessingGame.owner()).to.equal(accounts[0].address);
    //         })
    //         it("should show the rules", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             expect((await guessingGame.RULES()).minGuess).to.equal(0);
    //             expect((await guessingGame.RULES()).maxGuess).to.equal(100);
    //             expect((await guessingGame.RULES()).minPlayers).to.equal(5);
    //             expect((await guessingGame.RULES()).entryFee).to.equal(ethers.utils.parseEther("0.1"));

    //         })
    //     })

    //     describe("Start game", () => {
    //         it("should reject when not enough players enter the game", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await expect(guessingGame.startGame()).to.be.revertedWith("Not enough players.");
    //         })
    //         it("should reject when not the owner tries to start the game", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await expect(guessingGame.connect(accounts[1]).startGame()).to.be.revertedWith("only the owner can use this function.");
    //         })

    //         it("should print the right outcome values and select winner", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await guessingGame.connect(accounts[1]).enterGuess(20, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[2]).enterGuess(30, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[3]).enterGuess(50, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[4]).enterGuess(67, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[5]).enterGuess(5, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.startGame();

    //             expect((await guessingGame.outcome()).sum).to.be.equal(172);
    //             expect((await guessingGame.outcome()).target).to.be.equal(22);
    //             expect((await guessingGame.winner())).to.be.equal(accounts[1].address);

    //         })

    //         it("should select the right winner if tie", async () => {

    //             const { accounts, guessingGame } = await deployFixture();
    //             await guessingGame.connect(accounts[1]).enterGuess(70, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[2]).enterGuess(2, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[3]).enterGuess(90, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[4]).enterGuess(2, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[5]).enterGuess(96, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[6]).enterGuess(70, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[7]).enterGuess(2, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[9]).enterGuess(2, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[10]).enterGuess(96, { value: ethers.utils.parseUnits("0.1") });


    //             await guessingGame.startGame();
    //             const key = (await guessingGame.outcome()).key;
    //             const possibleWinners = await guessingGame.outcomePossibleWinners(key);
    //             const randomNumber = BigInt((await guessingGame.outcome()).randomNumber.toString());
    //             const index = Number(randomNumber % BigInt(4));

    //             const winner = possibleWinners[index];

    //             expect(await guessingGame.winner()).to.be.equal(winner);

    //         })

    //         it("should prevent any player to reenter or gameMaster to restart the game", async () => {
    //             const { accounts, guessingGame } = await deployFixture();
    //             await guessingGame.connect(accounts[1]).enterGuess(70, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[2]).enterGuess(2, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[3]).enterGuess(3, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[4]).enterGuess(50, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.connect(accounts[5]).enterGuess(90, { value: ethers.utils.parseUnits("0.1") });
    //             await guessingGame.startGame();

    //             expect(guessingGame.connect(accounts[1]).enterGuess(70, { value: ethers.utils.parseUnits("0.1") })).to.be.revertedWith("Game already started");
    //             await expect(guessingGame.startGame()).to.be.revertedWith("Game already started");
    //         })
    //     })

})
