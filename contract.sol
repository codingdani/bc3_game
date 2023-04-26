// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract GuessingGameL is VRFConsumerBase {
    struct Rules {
        uint256 min_guess;
        uint256 max_guess;
        uint256 min_players;
        uint256 entry_fee;
    }

    Rules public RULES;

    address public owner;
    address[] public players;
    mapping(address => uint256) private guesses;
    uint256 private sumGuesses;

    address public winner;
    uint256 public winningNumber;

    mapping(bytes32 => uint256) private randomNumbers;
    address[] private tiedPlayers;

    constructor(
        address _vrfCoordinator,
        address _linkToken,
        uint256 _min_guess,
        uint256 _max_guess,
        uint256 _min_players,
        uint256 _entry_fee
    ) VRFConsumerBase(_vrfCoordinator, _linkToken) {
        owner = msg.sender;
        RULES = Rules(_min_guess, _max_guess, _min_players, _entry_fee);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only the owner can use this function.");
        _;
    }

    function enterGuess(uint256 _guess) public payable {
        require(msg.value == RULES.entry_fee, "Insufficient entry fee.");
        require(
            _guess >= RULES.min_guess && _guess <= RULES.max_guess,
            "Check your input value."
        );
        require(guesses[msg.sender] == 0, "You have already entered a guess.");
        players.push(msg.sender);
        guesses[msg.sender] = _guess; //
        sumGuesses += _guess;
    }

    function startGame() public onlyOwner {
        require(players.length >= RULES.min_players, "Not enough players");
        uint256 target = ((sumGuesses / players.length) * 66) / 100; // geändert von /3 * 2 wegen genauigkeit und rundung von solidity
        uint256 closestGuess = RULES.max_guess;
        address closestPlayer;

        for (uint256 i = 0; i < players.length; i++) {
            uint256 playerGuess = guesses[players[i]];
            uint256 diff = playerGuess > target
                ? playerGuess - target
                : target - playerGuess;
            if (diff < closestGuess) {
                closestGuess = diff;
                closestPlayer = players[i];
                tiedPlayers[0] = closestPlayer;
            } else if (diff == closestGuess) {
                tiedPlayers.push(players[i]);
            }
        }
        if (tiedPlayers.length > 1) {
            uint256 winnerIndex = uint256(randomNumbers[0]) %
                (tiedPlayers.length + 1);
            winner = tiedPlayers[winnerIndex];
            tiedPlayers = new address[](0);
        } else {
            winner = closestPlayer;
        }

        winningNumber = target;
        payout();
    }

    function payout() private {
        uint256 amount = address(this).balance;
        require(amount > 0, "No balance to payout.");
        require(winner != address(0), "Winner has not been announced yet.");
        payable(winner).transfer(amount);
    }

    function getPlayerCount() public view returns (uint256) {
        return players.length;
    }

    function getMyGuess() public view returns (uint256) {
        return guesses[msg.sender];
    }

    function requestRandomNumber() private returns (bytes32) {
        require(
            LINK.balanceOf(address(this)) >= 1,
            "Not enough LINK to fulfill request"
        );
        bytes memory encodedSeed = abi.encodePacked(
            block.timestamp,
            block.number
        );
        bytes32 requestId = requestRandomness(bytes32(encodedSeed), 0);
        randomNumbers[requestId] = 0;
        return requestId;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomNumbers[requestId] = randomness;
    }

    receive() external payable {
        revert(
            "This contract does not accept Ether, if you don't participate in the Game."
        );
    }
}
