// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Token {
    address private owner;

    mapping(address => uint8) private whiteList;

    event ProxyDeposit(address indexed token, address indexed from, address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier checkOfWhiteLists(address adr) {
        require(whiteList[adr] == 1, "Not WhiteList");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function changeWhiteList(address[] calldata adrs, uint8[] calldata onOrOff) external onlyOwner {
        require(adrs.length == onOrOff.length, "Other array size");
        for (uint256 i; i < adrs.length;) {
            whiteList[adrs[i]] = onOrOff[i]; 
            unchecked { i++; }
        }
    }

    function setOwner(address wallet) external onlyOwner returns (address) {
        owner = wallet;
        return owner;
    }

    function proxyToken(
        address token,
        address to,
        uint256 amount
    ) public payable checkOfWhiteLists(to) {
        IERC20(token).transferFrom(msg.sender, to, amount);

        emit ProxyDeposit(token, msg.sender, to, amount);
    }
}