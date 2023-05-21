import React, { useState, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormData from 'form-data';
import MintComponent from './MintComponent';


function ImageGenerator() {
  const [input, setInput] = useState('');
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [ipfsLink, setIpfsLink] = useState('');
  const navigate = useNavigate();
  const [isImageSelected, setImageSelected] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  const handleCustomTitleChange = (e) => {
    setCustomTitle(e.target.value);
  };
  const query = async (data) => {
    const response = await fetch(
      'https://c8gxfycvtyrqil84.us-east-1.aws.endpoints.huggingface.cloud',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_HUGGINGFACE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: data.inputs,
          seed: data.seed,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    console.log('Content type:', contentType);

    const base64ImageData = await response.text();
    console.log('Base64 image data:', base64ImageData);

    if (!base64ImageData) {
      throw new Error('Image data not found in the API response');
    }

    setImageData(base64ImageData.replace(/"/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const randomSeed = Math.floor(Math.random() * 10000);
    const promptText = `${input}`;
    console.log('promptText:', promptText);
    console.log('randomSeed:', randomSeed);
    query({ inputs: promptText, seed: randomSeed })
      .then(() => {
        setIsLoading(false); // Set isLoading to false after image generation
      })
      .catch((error) => {
        console.error('Error generating image:', error);
        setIsLoading(false); // Set isLoading to false in case of an error
      });
      
  };
  

  const [isMinting, setIsMinting] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  const mintImage = async () => {
    setIsMinting(true);
    try {
      if (!image) {
        throw new Error('No image selected');
      }
  
      const reader = new FileReader();
      reader.onloadend = async () => {
        const buffer = Buffer.from(reader.result);
  
        // Upload the image to IPFS
        let imageData = new FormData();
        imageData.append('file', new Blob([buffer]), 'image.png');
  
        const imageResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
          },
          body: imageData,
        });
  
        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          throw new Error(`Failed to pin image file to IPFS: ${imageResponse.statusText}\n${errorText}`);
        }
  
        const imagePinataResponse = await imageResponse.json();
        const imageUrl = `ipfs://${imagePinataResponse.IpfsHash}`;
        console.log('Image URL:', imageUrl);
  
        // Create the metadata object
        const metadata = {
          name: customTitle, // Include the custom title
          description: '',
          image: imageUrl,
          attributes: [],
          compiler: 'mintfoundry.xyz',
        };
  
  
        // Convert the metadata object to JSON string
        const metadataString = JSON.stringify(metadata);
  
        // Upload the metadata to IPFS
        let metadataData = new FormData();
        metadataData.append('file', new Blob([metadataString]), 'metadata.json');
  
        const metadataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
            pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY,
          },
          body: metadataData,
        });
  
        if (!metadataResponse.ok) {
          const errorText = await metadataResponse.text();
          throw new Error(`Failed to pin metadata file to IPFS: ${metadataResponse.statusText}\n${errorText}`);
        }
  
        const metadataPinataResponse = await metadataResponse.json();
        const metadataUrl = `ipfs://${metadataPinataResponse.IpfsHash}`;
        console.log('Metadata URL:', metadataUrl);
  
        // Set the IPFS link as the image URI
        setImageUri(metadataUrl);
        console.log('IPFS link:', metadataUrl);

      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      reader.readAsArrayBuffer(image);
    } catch (error) {
      console.error('Error uploading image to IPFS:', error);
    }
    setImageSelected(true);

  };
  

  useEffect(() => {
    if (imageData) {
      const blob = b64toBlob(imageData);
      setImage(blob);
    }
  }, [imageData]);

  const b64toBlob = (b64Data) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: 'image/png' });
  };

  

  return (
    <div className="modal">
      {!isImageSelected ? ( // If the image has not been selected, show the form and the "Generate Image" button
        <form onSubmit={handleSubmit} className="modal-content button-container">
          <input
            className="input-field"
            type="text"
            placeholder="milady,"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
<button className="submit-button" type="submit" disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Generate Image'}
</button>

        </form>
      ) : null} 
      {image && (
        <div className="modal-content button-container">
          <img src={URL.createObjectURL(image)} alt="Generated" />
          {!imageUri && (
            <div>
              <input
                className="input-field"
                type="text"
                placeholder="title *permanent"
                value={customTitle}
                onChange={handleCustomTitleChange}
              />
              <button
                className="mint-button"
                onClick={mintImage}
                disabled={isMinting || isMinted}
              >
                this is the one i want (mint)
              </button>
            </div>
          )}
          {imageUri && (
            <MintComponent imageUri={`${imageUri}/`} ipfsLink={ipfsLink} />
          )}
        </div>
      )}
    </div>
  );
}
  
export default ImageGenerator;