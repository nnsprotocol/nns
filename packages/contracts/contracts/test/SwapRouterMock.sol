// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./ERC20Mock.sol";
import "../interfaces/IV3SwapRouter.sol";

contract SwapRouterMock is IV3SwapRouter {
    ERC20Mock _erc20;
    uint256 _exchange = 2;

    constructor(ERC20Mock erc20) {
        _erc20 = erc20;
    }

    function setExchange(uint256 exchange) external {
        _exchange = exchange;
    }

    function exactInputSingle(
        IV3SwapRouter.ExactInputSingleParams calldata params
    ) external payable returns (uint256 amountOut) {
        require(params.tokenOut == address(_erc20), "invalid erc20");

        amountOut = _exchange * params.amountIn;
        _erc20.mint(msg.sender, amountOut);

        return amountOut;
    }
}
