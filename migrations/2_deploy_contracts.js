const CryptoMultisender = artifacts.require("CryptoMultisender");
const Token = artifacts.require("Token");
const DeflationaryToken = artifacts.require("DeflationaryToken");
const ERC721Token = artifacts.require("NFTCollectibleERC721");
const ERC1155Token = artifacts.require("NFTCollectibleERC1155");

module.exports = function(deployer) {
  deployer.deploy(CryptoMultisender);
  deployer.deploy(Token);
  deployer.deploy(DeflationaryToken, 
    "DEFT2", "DEFT2", 18, "25000000000000000000000000", 1, 1, "0x704ab0925fF80b69fDBb32892346B6c945Af79E9", "0x704ab0925fF80b69fDBb32892346B6c945Af79E9"
  );
  deployer.deploy(ERC721Token,"/");
  deployer.deploy(ERC1155Token,"/");
};
