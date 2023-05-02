const { ethers } = require('hardhat');
const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const metadata = "https://opensea-creatures-api.herokuapp.com/api/creature/1"

    const compFactory = await hre.ethers.getContractFactory("Competition");
    const compContract = await compFactory.deploy();
    await compContract.deployed();

    /*const mintFactory = await hre.ethers.getContractFactory("Minter");
    const mintContract = await mintFactory.deploy();
    await mintContract.deployed();*/

    console.log("Contract deployed by:", owner.address);
    var buyTXoptions = { value: hre.ethers.utils.parseEther('0.01'), gasLimit: 500_000}
    var buyTXoptions2 = { value: hre.ethers.utils.parseEther('0.001') }
    var btx = hre.ethers.utils.parseEther('0.01') 
    //await compContract.addAdmin(randomPerson.address)
    //await compContract.connect(randomPerson).addAdmin(randomPerson.address)
    //await compContract.connect(randomPerson).startCompetition(50, btx, "Beat")
    //await compContract.startCompetition(1, btx, "Beat")
    //console.log(await compContract.getCompetitionStats())
    //await compContract.buyin(buyTXoptions)
    //await compContract.connect(randomPerson).buyin(buyTXoptions2)
   /* console.log(await compContract.getCompetitionStats())
    await compContract.getWinners()
    await compContract.cancelCompetition()
    await compContract.startCompetition(50, btx, "Beat")
    console.log(await compContract.getCompetitionStats())
    */
    const isUser = await compContract.getIfUserInComp()
    // Minting the token
    if(isUser == true){
      const transaction= await compContract.mintNFTLogic(
          metadata,
          {
            gasLimit: 500_000,
          },
        )}
    else {
      const transaction= await compContract.mintNFTLogic(
        metadata,buyTXoptions,
        /*{
          gasLimit: 500_000,
        },*/
      )
      const tx = await transaction.wait() 
      const event = tx.events[0];
      const value = event.args[2];
      const tokenId = value.toNumber(); // Getting the tokenID
      const tokenURI = await compContract.tokenURI(tokenId) // Using the tokenURI from ERC721 to retrieve de metadata
      console.log(tokenId)
      console.log(tokenURI)
    }
    
    
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();