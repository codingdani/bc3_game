//SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "./CloneFactory.sol";
import "./GuessingGame.sol";

contract Factory is CloneFactory {
    GuessingGame[] public children;
    address masterContract;

    constructor(address _masterContract) {
        masterContract = _masterContract;
    }

    function createGame(
        uint256 _minGuess,
        uint256 _maxGuess,
        uint256 _minPlayers,
        uint256 _entryFee
    ) external {
        GuessingGame game = GuessingGame(payable(createClone(masterContract)));
        game.init(_minGuess, _maxGuess, _minPlayers, _entryFee, msg.sender);
        children.push(game);
    }
}
