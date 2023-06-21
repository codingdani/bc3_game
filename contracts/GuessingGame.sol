// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GuessingGame is ReentrancyGuard {
    event CommitMade(address indexed _from, bytes32 _hash);
    event RevealStart(address indexed _from, uint256 _deadline);
    event RevealMade(address indexed _from, uint256 _guess);
    event WinnerDeclared(address indexed _winner);
    event WinnerWithdrawn();
    event OwnerWithdrawn();

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

    struct Player {
        address _address;
        uint256 guess;
    }

    // This struct is mainly for the scoreboard in frontend
    struct Result {
        uint256 target;
        uint256 winningAmount;
        uint256 serviceFeeAmount;
    }

    Result public result;
    Phase public phase;
    Rules public RULES;

    mapping(address => Commit) private commits;
    mapping(address => bool) private hasWithdrawn;
    address[] public players;

    uint256 public revealDeadline;
    uint256 public expired;

    uint256 private sum;
    uint256 public revealedPlayers;

    address public owner;
    address public winner;
    bool private winnerHasWithdrawn;
    bool private ownerHasWithdrawn;

    bool private isInit = false;
    bool public isStarted = false;

    function init(
        uint256 _minGuess,
        uint256 _maxGuess,
        uint256 _minPlayers,
        uint256 _entryFee,
        address _owner
    ) external {
        require(!isInit, "The game has already been initialized");
        require(
            _maxGuess > _minGuess,
            "Max guess must be greater than min guess."
        );
        require(_minPlayers >= 2, "There must be atleast 2 players");
        owner = _owner;
        RULES = Rules(_minGuess, _maxGuess, _minPlayers, _entryFee);
        isInit = true;
        expired = block.timestamp + WEEK;
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

    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    function getPlayerCount() external view returns (uint256) {
        return players.length;
    }

    function getIfPlayerRevealed() external view returns (bool) {
        return commits[msg.sender].revealed;
    }

    /// @notice A function that is mainly for frontend
    /// @return guesses as Array that has the form of [Player{address, guess}]

    function getGuessesAfterFinish() external view returns (Player[] memory) {
        require(isStarted, "You cannot see the guesses yet!");
        Player[] memory guesses = new Player[](players.length);
        for (uint256 i = 0; i < players.length; i++) {
            Player memory player;
            player._address = players[i];
            if (commits[players[i]].revealed) {
                player.guess = commits[players[i]].guess;
            } else {
                player.guess = RULES.maxGuess + 1;
            }
            guesses[i] = player;
        }
        return guesses;
    }

    /// @notice It receives an submitted Hash from a player
    /// @dev The hash get persisted in a state variable and will be later checked on

    function commitHash(bytes32 _hash) external payable gameExpired {
        require(phase == Phase.Commit, "The commit phase is over.");
        require(msg.value == RULES.entryFee, "Insufficient entry fee.");
        require(
            commits[msg.sender].commit == 0,
            "You have already entered a guess."
        );
        players.push(msg.sender);
        commits[msg.sender].commit = _hash;
        emit CommitMade(msg.sender, _hash);
    }

    /// @notice After the game starts, the player has to reveal their values

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
        emit RevealMade(msg.sender, guess);
    }

    /// @notice After a certain period of time, to prevent frozen assets, any user can withdraw their asset

    function withdraw() external nonReentrant {
        uint256 time = block.timestamp;
        require(time > expired && !isStarted, "You cannot withdraw.");
        require(commits[msg.sender].commit != 0, "You didn't participate.");
        require(!hasWithdrawn[msg.sender], "You already withdrawed.");
        hasWithdrawn[msg.sender] = true;
        (bool sent, ) = msg.sender.call{value: RULES.entryFee}("");
        require(sent, "Withdraw has failed");
    }

    /// @notice After each player has committed a hash, the gamemaster can start the reveal Phase

    function startRevealPhase() external onlyOwner gameExpired {
        require(phase == Phase.Commit, "Already started reveal phase.");
        require(players.length >= RULES.minPlayers, "Not enough players.");
        phase = Phase.Reveal;
        revealDeadline = block.timestamp + DAY;
        emit RevealStart(owner, revealDeadline);
    }

    /// @notice The actual game will be played here. Also the winner will be selected in this function

    function finishGame() external gameExpired {
        uint256 time = block.timestamp;
        require(
            time > revealDeadline ||
                (revealedPlayers == players.length && msg.sender == owner),
            "The reveal deadline isn't over yet."
        );
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
        result.winningAmount = (address(this).balance * 95) / 100;
        result.serviceFeeAmount = (address(this).balance * 5) / 100;
        emit WinnerDeclared(winner);
    }

    /// @notice After a game is finished, the winner can retrieve his/her winnings

    function payout() external nonReentrant {
        require(winner == msg.sender, "You are not the winner.");
        require(!winnerHasWithdrawn, "You already withdrawed your win.");
        winnerHasWithdrawn = true;
        (bool sent, ) = winner.call{value: result.winningAmount}("");
        require(sent, "There was withdraw error.");
        emit WinnerWithdrawn();
    }

    /// @notice After a game is finished, the game master can retrieve his service fee in relation to the winnings

    function retrieveServiceFee() external onlyOwner nonReentrant {
        require(!ownerHasWithdrawn, "You retrieved your fees already.");
        ownerHasWithdrawn = true;
        (bool sent, ) = owner.call{value: result.serviceFeeAmount}("");
        require(sent, "There was a withdraw error.");
        emit OwnerWithdrawn();
    }

    /// @notice This function finds out the minimum difference to a target number from all player
    /// @param minDiff is the Rules largest number that a player can possible tip
    /// @param target is a number that has been calculated from the sum of all players
    /// @return minDiff is a number representing the minimun difference from all players from a target value
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

    /// @notice This function determines the amount of possible winners
    /// @param minDiff is the minimum difference from all players from a target number
    /// @param target is a number that has been calculated from the sum of all players
    /// @param count This number will be 0 since there is no winner yet
    /// @return count is the number of possible winners

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

    /// @notice This function determines all possible Winners
    /// @param minDiff is the minimum difference from all players from a target number
    /// @param target is a number that has been calculated from the sum of all players
    /// @param countWinners is a number that represents the number of all possible Winners
    /// @return possibleWinners is an array that contains all possible winners

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
    function random() private view returns (uint256) {
        return
            uint256(
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
