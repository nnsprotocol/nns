// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "./ERC20Mock.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

contract SwapRouterMock is ISwapRouter {
    ERC20Mock _erc20;
    uint256 _exchange = 2;

    constructor(ERC20Mock erc20) {
        _erc20 = erc20;
    }

    function setExchange(uint256 exchange) external {
        _exchange = exchange;
    }

    function exactInputSingle(
        ISwapRouter.ExactInputSingleParams calldata params
    ) external payable returns (uint256 amountOut) {
        require(params.tokenOut == address(_erc20), "invalid erc20");

        amountOut = _exchange * params.amountIn;
        _erc20.mint(msg.sender, amountOut);

        return amountOut;
    }

    function exactInput(
        ISwapRouter.ExactInputParams calldata
    ) external payable returns (uint256) {
        revert("not implemented");
    }

    function exactOutputSingle(
        ISwapRouter.ExactOutputSingleParams calldata
    ) external payable returns (uint256) {
        revert("not implemented");
    }

    function exactOutput(
        ISwapRouter.ExactOutputParams calldata
    ) external payable returns (uint256) {
        revert("not implemented");
    }

    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external {}
}
