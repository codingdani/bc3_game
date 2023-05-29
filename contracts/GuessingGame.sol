// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "../node_modules/hardhat/console.sol";

// TODO: Events, WithdrawWinnings, Test tie, fee structur
contract GuessingGame {
    uint256 public constant DAY = 86400; //seconds
    uint256 public constant WEEK = DAY * 7; //seconds

    enum Phase {
        Commit,
        Reveal
    }

    struct Rules {
        uint256 minGuess;
        uint256 maxGuess;
        uint256 minPlayers;
        uint256 entryFee;
    }

    struct Commit {
        bytes32 commit;
        bool revealed;
        uint256 guess;
    }
    Phase public phase;
    Rules public RULES;

    mapping(address => Commit) private commits;
    mapping(address => bool) private hasWithdrawn;
    address[] public players;

    uint256 public revealDeadline;
    uint256 public finishGameDeadline;

    uint256 public expired = block.timestamp + WEEK;

    /************************** */

    /**************** Game calculation */
    uint256 sum;
    uint256 revealedPlayers;

    address public owner;
    address public winner;
    bool isInit = false;
    bool isStarted = false;

    function init(
        uint256 _minGuess,
        uint256 _maxGuess,
        uint256 _minPlayers,
        uint256 _entryFee,
        address _owner
    ) external {
        require(!isInit, "The game has already been initialized");
        owner = _owner;
        RULES = Rules(_minGuess, _maxGuess, _minPlayers, _entryFee);
        isInit = true;
    }

    receive() external payable {
        revert(
            "This contract does not accept Ether, if you don't participate in the Game."
        );
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only the owner can use this function.");
        _;
    }

    modifier gameExpired() {
        require(block.timestamp < expired, "Game is expired.");
        _;
    }

    function getPlayerCount() external view returns (uint256) {
        return players.length;
    }

    function getMyGuess() external view returns (uint256) {
        require(commits[msg.sender].revealed == true, "There is no guess.");
        return commits[msg.sender].guess;
    }

    function commitHash(bytes32 _hash) external payable gameExpired {
        require(phase == Phase.Commit, "The commit phase is over.");
        require(msg.value == RULES.entryFee, "Insufficient entry fee.");
        require(
            commits[msg.sender].commit == 0,
            "You have already entered a guess."
        );
        players.push(msg.sender);
        commits[msg.sender].commit = _hash;
    }

    function reveal(uint256 guess, uint256 salt) external gameExpired {
        bytes32 commit = keccak256(abi.encodePacked(guess, salt));
        require(phase == Phase.Reveal, "It's not the time to reveal yet.");
        require(block.timestamp < revealDeadline, "Reveal deadline is over.");
        require(commits[msg.sender].commit != 0, "There is no commit.");
        require(!commits[msg.sender].revealed, "Guess was already revealed.");
        require(commit == commits[msg.sender].commit, "Wrong guess or salt.");

        commits[msg.sender].revealed = true;
        commits[msg.sender].guess = guess;
        sum += guess;
        revealedPlayers += 1;
    }

    function withdraw() external {
        uint256 time = block.timestamp;
        require(time > expired && !isStarted, "You cannot withdraw.");
        require(commits[msg.sender].commit != 0, "You didn't participate.");
        require(!hasWithdrawn[msg.sender], "You already withdrawed.");
        hasWithdrawn[msg.sender] = true;
        address payable receiver = payable(msg.sender);
        receiver.transfer(RULES.entryFee);
    }

    function startRevealPhase() external onlyOwner gameExpired {
        require(phase == Phase.Commit, "Already started reveal phase.");
        require(players.length >= RULES.minPlayers, "Not enough players.");
        phase = Phase.Reveal;
        revealDeadline = block.timestamp + DAY;
    }

    function finishGame() public onlyOwner gameExpired {
        uint256 time = block.timestamp;
        require(time > revealDeadline, "The reveal deadline isn't over yet.");
        require(revealedPlayers != 0, "Nobody revealed their guess yet.");
        require(!isStarted, "Game already started");
        isStarted = true;
        uint256 target = ((sum / revealedPlayers) * 66) / 100;
        uint256 minDiff = calcWinningDiff(RULES.maxGuess, target);
        uint256 countWinners = getAmountOfWinners(minDiff, target, 0);
        address[] memory possibleWinners = getPossibleWinners(
            minDiff,
            target,
            countWinners
        );
        uint256 randomNumber = random();
        uint256 winnerIndex = randomNumber % (possibleWinners.length);
        winner = possibleWinners[winnerIndex];
    }

    function calcWinningDiff(
        uint256 minDiff,
        uint256 target
    ) private view returns (uint256) {
        for (uint256 i = 0; i < players.length; i++) {
            if (
                commits[players[i]].revealed == true &&
                absDiff(commits[players[i]].guess, target) <= minDiff
            ) {
                minDiff = absDiff(commits[players[i]].guess, target);
            }
        }
        return minDiff;
    }

    function absDiff(
        uint256 num1,
        uint256 num2
    ) private pure returns (uint256) {
        if (num1 >= num2) {
            return num1 - num2;
        } else {
            return num2 - num1;
        }
    }

    function getAmountOfWinners(
        uint256 minDiff,
        uint256 target,
        uint256 count
    ) private view returns (uint256) {
        for (uint256 i = 0; i < players.length; i++) {
            if (
                commits[players[i]].revealed == true &&
                minDiff == absDiff(commits[players[i]].guess, target)
            ) {
                count++;
            }
        }
        return count;
    }

    function getPossibleWinners(
        uint256 minDiff,
        uint256 target,
        uint256 countWinners
    ) private view returns (address[] memory) {
        address[] memory possibleWinners = new address[](countWinners);
        uint256 amount = 0;
        for (uint256 i = 0; i < players.length; i++) {
            if (
                commits[players[i]].revealed == true &&
                minDiff == absDiff(commits[players[i]].guess, target)
            ) {
                possibleWinners[amount] = players[i];
                amount++;
            }
        }
        return possibleWinners;
    }

    // this is pseudo random generator, A miner can actually influence this
    // it's better to use chainlink for that e.g. GM has to get random number first before starting the game
    function random() private view returns (uint) {
        return
            uint(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        block.number
                    )
                )
            );
    }

    // CommitPhase 1 day
    // Two cases:
    // 1. All necessary player committed -> startGameDeadline set for GM
    // 2. Not Enough players -> Player can withdraw their funds
    // One Day reveal time for players

    // If some revealed but the other didnt reveal after a given timeframe
    // the game can still be started by anyone and therefore all of them looses

    //     function enterGuess(uint256 _guess) external payable {
    //         require(!isStarted, "Game already started");
    //         require(msg.value == RULES.entryFee, "Insufficient entry fee.");
    //         require(
    //             _guess >= RULES.minGuess && _guess <= RULES.maxGuess,
    //             "Check your input value."
    //         );
    //         require(
    //             playersGuesses[msg.sender] == 0,
    //             "You have already entered a guess."
    //         );
    //         players.push(msg.sender);
    //         playersGuesses[msg.sender] = _guess;
    //     }

    //     function startGame() external onlyOwner {
    //         require(!isStarted, "Game already started");
    //         isStarted = true;
    //         require(players.length >= RULES.minPlayers, "Not enough players.");
    //         uint256 sum = sumGuesses();
    //         uint256 target = ((sum / players.length) * 66) / 100;
    //         uint256 minDiff = calcWinningDiff(RULES.maxGuess, target);
    //         uint256 countWinners = getAmountOfWinners(minDiff, target, 0);
    //         address[] memory possibleWinners = getPossibleWinners(
    //             minDiff,
    //             target,
    //             countWinners
    //         );
    //         uint256 randomNumber = random();
    //         uint256 winnerIndex = randomNumber % (possibleWinners.length);
    //         winner = possibleWinners[winnerIndex];

    //         outcome.key = minDiff;
    //         outcome.sum = sum;
    //         outcome.target = target;
    //         outcome.randomNumber = randomNumber;
    //         outcome.possibleWinners[minDiff] = possibleWinners;
    //         payout();
    //     }

    //     function sumGuesses() private view returns (uint256) {
    //         uint256 sum = 0;
    //         for (uint256 i = 0; i < players.length; i++) {
    //             sum += playersGuesses[players[i]];
    //         }
    //         return sum;
    //     }

    //     function outcomePossibleWinners(
    //         uint256 key
    //     ) public view returns (address[] memory) {
    //         return outcome.possibleWinners[key];
    //     }

    //     function getPossibleWinners(
    //         uint256 minDiff,
    //         uint256 target,
    //         uint256 countWinners
    //     ) private view returns (address[] memory) {
    //         address[] memory possibleWinners = new address[](countWinners);
    //         uint256 amount = 0;
    //         for (uint256 i = 0; i < players.length; i++) {
    //             if (minDiff == absDiff(playersGuesses[players[i]], target)) {
    //                 possibleWinners[amount] = players[i];
    //                 amount++;
    //             }
    //         }
    //         return possibleWinners;
    //     }

    //     function calcWinningDiff(
    //         uint256 minDiff,
    //         uint256 target
    //     ) private view returns (uint256) {
    //         for (uint256 i = 0; i < players.length; i++) {
    //             if (absDiff(playersGuesses[players[i]], target) <= minDiff) {
    //                 minDiff = absDiff(playersGuesses[players[i]], target);
    //             }
    //         }
    //         return minDiff;
    //     }

    //     function getAmountOfWinners(
    //         uint256 minDiff,
    //         uint256 target,
    //         uint256 count
    //     ) private view returns (uint256) {
    //         for (uint256 i = 0; i < players.length; i++) {
    //             if (minDiff == absDiff(playersGuesses[players[i]], target)) {
    //                 count++;
    //             }
    //         }
    //         return count;
    //     }

    //     function absDiff(
    //         uint256 num1,
    //         uint256 num2
    //     ) private pure returns (uint256) {
    //         if (num1 >= num2) {
    //             return num1 - num2;
    //         } else {
    //             return num2 - num1;
    //         }
    //     }

    //     function payout() private {
    //         require(winner != address(0), "Winner has not been announced yet.");
    //         uint256 amount = address(this).balance;
    //         require(amount > 0, "No balance to payout.");
    //         payable(winner).transfer(amount);
    //     }

    //     // this is pseudo random generator, A miner can actually influence this
    //     // it's better to use chainlink for that
    //     function random() private view returns (uint) {
    //         return
    //             uint(
    //                 keccak256(
    //                     abi.encodePacked(
    //                         block.timestamp,
    //                         block.prevrandao,
    //                         block.number
    //                     )
    //                 )
    //             );
    //     }
}
