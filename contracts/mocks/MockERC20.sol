// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {

    constructor(uint256 _amount) ERC20("TokenERC20", "TKN20") {
        _mint(msg.sender, _amount * 10 ** decimals());
    }
}