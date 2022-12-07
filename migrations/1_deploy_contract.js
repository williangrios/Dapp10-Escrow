const Escrow = artifacts.require("Escrow");

module.exports = function(deployer, accounts){
    const ben = "0x16cC187AF3bc8fce7AEF43007f4d5Daf93E022BD";
    const payer = "0xe8033024b4A08462886Fe2ba1ce5AF06e0418308";
    deployer.deploy(Escrow, payer, ben, 1000000);
}