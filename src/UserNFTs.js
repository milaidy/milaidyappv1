import React, { useState, useEffect } from 'react';

function UserNFTs({ account }) {
  const [userNFTs, setUserNFTs] = useState([]);

  useEffect(() => {
    if (account) {
      fetchUserNFTs();
    }
  }, [account]);


    const contractAddresses = [
      '0x499De9CF6465c050aE116Afcbf9105e1d7259cb7', // First contract address
      '0x5Af0D9827E0c53E4799BB226655A1de152A425a5', // Second contract address
    ];

      const fetchUserNFTs = async () => {
        try {
          let userNFTs = [];
          for (const contractAddress of contractAddresses) {
            const response = await fetch(`https://api.opensea.io/api/v1/assets?owner=${account}&asset_contract_address=${contractAddress}`);
            const data = await response.json();
            userNFTs = userNFTs.concat(data.assets);
          }
          setUserNFTs(userNFTs);
        } catch (error) {
          console.error('Error fetching user NFTs:', error);
        }
      };
      

  return (
    <div>
      <h2>your collection</h2>
      <div className="user-nfts-container">
        {userNFTs.length > 0 ? (
          userNFTs.map((nft) => (
            <div key={nft.token_id}>
              <img src={nft.image_thumbnail_url} alt={nft.name} />
              <p>{nft.name}</p>
            </div>
          ))
        ) : (
          <h2>You have no NFTs.</h2>
        )}
      </div>
    </div>
  );
}

export default UserNFTs;
