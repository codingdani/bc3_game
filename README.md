Hello there,

to get the game up and running you need to install the dependencies with the command:

$ npm install 

in a console navigated to the frontend folder.

/////////////////////////////////////////////////////////////////////////////////

To access the Sepolia Blockchain via the Infura Provider you need to create a .env file in the frontend folder.
There is a .env_example file to show the structure.

/////////////////////////////////////////////////////////////////////////////////

Take your Infura API Key for the SEPOLIA Testnet WEBSOCKETS and save it as REACT_APP_INFURA_KEY in your .env file in the frontend folder.

Just your personal API Key, not the whole Link.

/////////////////////////////////////////////////////////////////////////////////

The Factory Contract is deployed with the Address:

0xFB4a9f21AF37D78C5bE737BC89f62c8B3dF915C9

Save it as REACT_APP_FACTORY_CONTRACT in your .env file.

/////////////////////////////////////////////////////////////////////////////////

The Guessing Game Contract is deployed with the Address:

0x44138C44AE33a07e7a4c01dA6cEDbA4b4eC67cad

Technically you won't need it, but you can save it in your .env file.

/////////////////////////////////////////////////////////////////////////////////

If this does not work, you can go into to frontend/src/utils/interact.ts and hardcode the information in there.



