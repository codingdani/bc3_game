require('dotenv').config();

module.exports = {
    env: {
        REACT_APP_INFURA_KEY: process.env.REACT_APP_INFURA_KEY,
        REACT_APP_FACTORY_CONTRACT: process.env.REACT_APP_FACTORY_CONTRACT,
        REACT_APP_GG_CONTRACT: process.env.REACT_APP_GG_CONTRACT,
    }
}