# Marketplace Backend API
This is the backend server API for the Marketplace. This monorepo consist of 3 APIs
 1. CORE API - Items, Products, CustomProducts, Designs, Color, etc; these are the founding features of the Ecommerce
 2. PICKUP API - Storage pickup of Items and Barcode printing
 3. REST API - APIs that cannot be implemented via GraphQL 

## IMPORTANT NOTE:
The environment variables define what would be used by your local project. Be very careful on defining them to avoid accidentally updating data on the wrong environment.

### STEP 1. SETTING UP THE APP

- Open up the terminal/command-line and change the directory to the root folder of the app.
- Enter `npm ci -D` to install necessary modules

### STEP 2. SETTING UP THE ENVIRONMENT VARIABLES
 1. Make sure you have a mongodb server. My suggestion is to use Free Tier of MongoDB atlas even in local. Just switch database for different environments.
 2. Copy `.env.example` to same directory and rename it to `.env`. Open `.env` and fill-up the environment variables.

### STEP 3 (OPTIONAL). RUNNING SEEDERS
 1. Run `node_modules/.bin/md-seed run --dropdb` to upload fake data to your selected mongodb database. Be careful, you might overwrite the wrong database.

### STEP 4. RUNNING THE APP
 1. Once you've setup the `.env`, go to the cmd and enter `npm run core` for CORE API, `npm run pickup` for PICKUP API. This runs your code locally in a `nodemon` server so everytime you CTRL + S, it will restart the server so the changes would reflect. (Note: changes to `.env` would not reflect automatically, you need to shutdown the local server and run it again)

```bash
npm run dev
```

### STEP 5. VIEW THE GRAPHQL PLAYGROUND
 1. You're code is now running at `localhost:8000/graphql` by default if you did not change the port.

