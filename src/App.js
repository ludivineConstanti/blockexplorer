import { Alchemy, Network, Utils } from "alchemy-sdk";
import { useEffect, useState } from "react";

import "./App.css";

const nftAddress = "0x5180db8F5c931aaE63c74266b211F580155ecac8";
const nftToken = "1590";

const transferAddress = "0x75ce2493ac75c4e294107e2ff067c00bd490a935";

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [block, setBlock] = useState();
  const [blockWithTransaction, setBlockWithTransaction] = useState();
  const [block1stTransaction, setBlock1stTransaction] = useState();
  const [transactionReceipt, setTransactionReceipt] = useState();
  const [gasPrice, setGasPrice] = useState();
  const [nftData, setNftData] = useState();
  const [transfers, setTransfers] = useState([]);

  useEffect(() => {
    async function getBlockInfos() {
      const blockNumber = await alchemy.core.getBlockNumber();
      setBlockNumber(blockNumber);
      if (blockNumber) {
        const block = await alchemy.core.getBlock(blockNumber);
        setBlock(block);
        const blockWithTransaction =
          await alchemy.core.getBlockWithTransactions(blockNumber);
        setBlockWithTransaction(blockWithTransaction);
        const block1stTransaction = blockWithTransaction.transactions[0];
        setBlock1stTransaction(blockWithTransaction.transactions[0]);
        if (block1stTransaction.hash) {
          const transactionReceipt = await alchemy.core.getTransactionReceipt(
            block1stTransaction.hash
          );
          setTransactionReceipt(transactionReceipt);
        }
      }
      setGasPrice(await alchemy.core.getGasPrice());
    }

    getBlockInfos();

    async function getNFTInfos() {
      const response = await alchemy.nft.getNftMetadata(nftAddress, nftToken);

      setNftData(response);
    }

    getNFTInfos();

    async function getOtherInfos() {
      const response = await alchemy.core.getAssetTransfers({
        fromAddress: transferAddress,
        category: ["erc721", "erc1155"],
      });

      setTransfers(response.transfers);
    }

    getOtherInfos();
  }, []);

  return (
    <div className="App">
      <h1>Infos</h1>
      <h2>Block</h2>
      <p>Block Number: {blockNumber}</p>
      {block && (
        <>
          <p>Block difficulty: {block.difficulty}</p>
          <p>Block timestamp: {block.timestamp}</p>
          <p>Block parent hash: {block.parentHash}</p>
        </>
      )}
      {blockWithTransaction && <p>Block miner: {blockWithTransaction.miner}</p>}
      {block1stTransaction && transactionReceipt && (
        <>
          <h2>Block 1st transaction</h2>
          <p>transaction index: {block1stTransaction.transactionIndex}</p>
          <p>data: {block1stTransaction.data}</p>
          <p>from: {transactionReceipt.from}</p>
          <p>to: {transactionReceipt.to}</p>
        </>
      )}
      <h2>Other</h2>
      {gasPrice && <p>Gas Price: {Utils.formatEther(gasPrice._hex)}</p>}
      <h2>NFT</h2>
      <p>Owner: {nftAddress}</p>
      <p>Token id: {nftToken}</p>
      {nftData && (
        <>
          <p>description: {nftData.description}</p>
          <p>Floor price: {nftData.contract.openSea.floorPrice}</p>
          <img src={nftData.rawMetadata.image} alt="" />
        </>
      )}
      <h2>Transfers</h2>
      <p>address: {transferAddress}</p>
      <p>number of transfers: {transfers.length}</p>
    </div>
  );
}

export default App;
