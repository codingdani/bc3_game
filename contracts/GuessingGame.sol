// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "../node_modules/hardhat/console.sol";

contract GuessingGame {
    struct Rules {
        uint256 minGuess;
        uint256 maxGuess;
        uint256 minPlayers;
        uint256 entryFee;
    }

    struct Outcome {
        uint256 key;
        uint256 sum;
        uint256 target;
        uint256 randomNumber;
        mapping(uint256 => address[]) possibleWinners;
    }

    /*************************************New Commit/Reveal Scheme logic */
    enum Phase {
        Commit,
        Reveal
    }

    struct Commit {
        bytes32 commit;
        bool revealed;
        uint256 guess;
    }

    mapping(address => Commit) private commits;
    mapping(address => bool) private hasWithdrawn;
    address[] public players1;

    uint256 public commitDeadline;
    uint256 public startGameDeadline;
    uint256 public revealDeadline;
    uint256 public finishGameDeadline;

    Phase public phase;

    /******************************** */

    Rules public RULES;
    Outcome public outcome;

    mapping(address => uint256) private playersGuesses;
    address[] public players;

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
        //set the deadlines for this contract: 1 Day to enter, 1 Day to reveal
        commitDeadline = block.timestamp + 86400;
        startGameDeadline = commitDeadline + 86400;
        phase = Phase.Commit;
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

    function getPlayerCount() external view returns (uint256) {
        return players.length;
    }

    function getMyGuess() external view returns (uint256) {
        return playersGuesses[msg.sender];
    }

    // commit

    function players1Length() external view returns (uint256) {
        return players1.length;
    }

    function commitHash(bytes32 _hash) external payable {
        require(
            block.timestamp <= commitDeadline,
            "The commit deadline is over."
        );
        require(msg.value == RULES.entryFee, "Insufficient entry fee.");
        require(
            commits[msg.sender].commit == 0,
            "You have already entered a guess."
        );
        players1.push(msg.sender);
        commits[msg.sender].commit = _hash;
    }

    function reveal(uint256 guess, uint256 salt) external {
        bytes32 commit = keccak256(abi.encodePacked(guess, salt));
        require(phase == Phase.Reveal, "It's not the time to reveal yet.");
        require(block.timestamp < revealDeadline, "The reveal time is over.");
        require(
            commits[msg.sender].commit != 0,
            "There is no commit to be revealed."
        );
        require(!commits[msg.sender].revealed, "Guess was already revealed.");

        require(
            commit == commits[msg.sender].commit,
            "You enter wrong guess or salt"
        );

        commits[msg.sender].revealed = true;
        commits[msg.sender].guess = guess;
    }

    // If something goes wrong during this game player can withdraw their funds
    function withdraw() external {
        bool isPastCommitDeadline = block.timestamp > commitDeadline;
        bool isBelowMinPlayers = players1.length < RULES.minPlayers;
        bool isPastStartGameDeadline = block.timestamp > startGameDeadline;
        bool isPhaseCommit = phase == Phase.Commit;
        bool isPastfinishGameDeadline = block.timestamp > finishGameDeadline;
        bool isPhaseReveal = phase == Phase.Reveal;
        require(
            (isPastCommitDeadline && isBelowMinPlayers) ||
                (isPastStartGameDeadline && isPhaseCommit) ||
                (isPastfinishGameDeadline && isPhaseReveal),
            "You cannot withdraw."
        );
        require(!hasWithdrawn[msg.sender], "You already withdrawed.");
        hasWithdrawn[msg.sender] = true;
        address payable receiver = payable(msg.sender);
        receiver.transfer(RULES.entryFee);
    }

    function startRevealPhase() external onlyOwner {
        uint256 time = block.timestamp;
        require(phase == Phase.Commit, "You can only start once");
        require(
            time > commitDeadline && time <= startGameDeadline,
            "You can only start if the commit deadline is over and you're passed your own deadline"
        );
        require(
            players1.length >= RULES.minPlayers,
            "You can only start if there is enough players"
        );
        phase = Phase.Reveal;
        revealDeadline = time + 86400;
        finishGameDeadline = revealDeadline + 86400;
    }

    function selectWinner() public onlyOwner {
        // start if reveal time is over and
    }

    // CommitPhase 1 day
    // Two cases:
    // 1. All necessary player committed -> startGameDeadline set for GM
    // 2. Not Enough players -> Player can withdraw their funds
    // One Day reveal time for players

    // If some revealed but the other didnt reveal after a given timeframe
    // the game can still be started by anyone and therefore all of them looses

    function enterGuess(uint256 _guess) external payable {
        require(!isStarted, "Game already started");
        require(msg.value == RULES.entryFee, "Insufficient entry fee.");
        require(
            _guess >= RULES.minGuess && _guess <= RULES.maxGuess,
            "Check your input value."
        );
        require(
            playersGuesses[msg.sender] == 0,
            "You have already entered a guess."
        );
        players.push(msg.sender);
        playersGuesses[msg.sender] = _guess;
    }

    function startGame() external onlyOwner {
        require(!isStarted, "Game already started");
        isStarted = true;
        require(players.length >= RULES.minPlayers, "Not enough players.");
        uint256 sum = sumGuesses();
        uint256 target = ((sum / players.length) * 66) / 100;
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

        outcome.key = minDiff;
        outcome.sum = sum;
        outcome.target = target;
        outcome.randomNumber = randomNumber;
        outcome.possibleWinners[minDiff] = possibleWinners;
        payout();
    }

    function sumGuesses() private view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < players.length; i++) {
            sum += playersGuesses[players[i]];
        }
        return sum;
    }

    function outcomePossibleWinners(
        uint256 key
    ) public view returns (address[] memory) {
        return outcome.possibleWinners[key];
    }

    function getPossibleWinners(
        uint256 minDiff,
        uint256 target,
        uint256 countWinners
    ) private view returns (address[] memory) {
        address[] memory possibleWinners = new address[](countWinners);
        uint256 amount = 0;
        for (uint256 i = 0; i < players.length; i++) {
            if (minDiff == absDiff(playersGuesses[players[i]], target)) {
                possibleWinners[amount] = players[i];
                amount++;
            }
        }
        return possibleWinners;
    }

    function calcWinningDiff(
        uint256 minDiff,
        uint256 target
    ) private view returns (uint256) {
        for (uint256 i = 0; i < players.length; i++) {
            if (absDiff(playersGuesses[players[i]], target) <= minDiff) {
                minDiff = absDiff(playersGuesses[players[i]], target);
            }
        }
        return minDiff;
    }

    function getAmountOfWinners(
        uint256 minDiff,
        uint256 target,
        uint256 count
    ) private view returns (uint256) {
        for (uint256 i = 0; i < players.length; i++) {
            if (minDiff == absDiff(playersGuesses[players[i]], target)) {
                count++;
            }
        }
        return count;
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

    function payout() private {
        require(winner != address(0), "Winner has not been announced yet.");
        uint256 amount = address(this).balance;
        require(amount > 0, "No balance to payout.");
        payable(winner).transfer(amount);
    }

    // this is pseudo random generator, A miner can actually influence this
    // it's better to use chainlink for that
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
}
