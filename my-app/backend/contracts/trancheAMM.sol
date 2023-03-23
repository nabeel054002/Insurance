//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./ITranche.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20{

    using SafeMath for uint256;

    address public tokenA;
    address public tokenB;
    constructor(address _tokenA, address _tokenB) ERC20 ("Exchange", "EXCH") {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    address public immutable me = address(this);

    function pool(uint256 amountA, uint256 amountB) public {
        require(ITranche(tokenA).transferFrom(tx.origin, me, amountA), "trancheA not transferred");
        require(ITranche(tokenB).transferFrom(tx.origin, me, amountB), "trancheB not transferred");
        if(ITranche(tokenA).balanceOf(me) == 0){
            _mint(tx.origin, amountA);
        } else {
            uint256 amt = amountB.mul((ITranche(tokenA).balanceOf(me)).sub(amountA)).div((ITranche(tokenA).balanceOf(me)).sub(amountA));
            _mint(tx.origin, amt);
        }
    }

    function swapInputA(uint256 amountA) public {
        require(ITranche(tokenA).transferFrom(tx.origin, me, amountA), "trancheA not transferred");
        uint256 amt = amountA.mul((ITranche(tokenB).balanceOf(me))).div((ITranche(tokenA).balanceOf(me)).sub(amountA));
        require(ITranche(tokenB).transfer(tx.origin, amt), "trancheB not transferred");
    }

    function swapInputB(uint256 amountB) public {
        require(ITranche(tokenB).transferFrom(tx.origin, me, amountB), "trancheB not transferred");
        uint256 amt = amountB.mul((ITranche(tokenA).balanceOf(me))).div((ITranche(tokenB).balanceOf(me)).sub(amountB));
        require(ITranche(tokenA).transfer(tx.origin, amt), "trancheA not transferred");
    }

    function liquidate (uint256 amount) public {
        require(ITranche(tokenA).transfer(tx.origin, amount), "trancheA not transferred");
        uint amt = amount.mul((ITranche(tokenB).balanceOf(me))).div((ITranche(tokenA).balanceOf(me)).add(amount));
        require(ITranche(tokenB).transfer(tx.origin, amt), "trancheB not transferred");
        _burn(tx.origin, amount);
    }

}