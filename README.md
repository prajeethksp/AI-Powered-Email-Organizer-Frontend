# Email Organizer Project

## Overview
This project is an Email Organizer application that integrates with the Gmail API to manage emails, including sending, receiving, and organizing them into different categories (inbox, sent, drafts, etc.). It includes features like fetching user emails, creating and sending drafts, and updating drafts.

## Prerequisites
* Node.js and npm installed
* MongoDB database
* Google Cloud project with Gmail API enabled
* OAuth 2.0 credentials set up in Google Cloud

## Installation & Setup

1. Clone the Repository (FRONT END)
```
git clone https://github.com/CloeKouadjo/emailorganizersummer2024_frontend.git
cd email-organizer
```

2. Clone the Repository (BACK END)
```
git clone https://github.com/CloeKouadjo/emailorganizersummer2024_backend.git
cd email-organizer
```

3. Install Dependencies (In Both Folders)
```
npm install
```

4. Environment Variables (FRONT END)
Create a .env file in the root directory and add the following variables:

```
REACT_APP_GOOGLE_KEY =your-google-key
REACT_APP_GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id
REACT_APP_GOOGLE_OAUTH_CLIENT_SECRET =your-google-client-secret
```


5. Environment Variables (BACK END)
Create a .env file in the root directory and add the following variables:

```
PORT=5050
ATLAS_URI=your-mongo-db-uri

GOOGLE_KEY =your-google-key
GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-key
GOOGLE_OAUTH_CLIENT_SECRET=your-google-auth-secret

OPENAI_API_KEY=your-open-ai-key

CRYPTO_SECRET_KEY=your-crypto-key
```

6. Start the server
```
npm start
```

7. Start the REACT
```
npm start
```


## Contributing
If you would like to contribute to this project, please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.