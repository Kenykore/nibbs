# MailMerge-e-SignatureSolution
This project seeks to accommodate the build of a mail merge and electronic signature solution as well as features and enhancements that have been identified to aid the adoption of the solution  in NIBSS,The backend server was built using Nodejs+Express and database technology MongoDB. For image and file management Cloudinary was used.

### Run Instructions!
To start the server simply clone,npm i and run npm start.
Dont forget to add the .env file , a sample .env.example file has been added listing the require environment variable.

For test deployment purposes the following env variables can be used
CLOUDINARY_URL=cloudinary://348696352296524:LbG6yI_VFlSGOtN9mn_IOdmepYc@comestibles
DEV_DB_URL=mongodb+srv://kenykore:boluwatife@cluster0-5qrlk.mongodb.net/nibbsdev?retryWrites=true&w=majority

### More information on environment variables
$ ENVIRONMENT= current environment either development, staging or production
$ PORT = env variable for current port
$ SMTP_USERNAME= SMTP username for mail server
$ SMTP_PASSWORD= SMTP password for mail server
$ TEST_DB_URL= test mongodb database url
$ DEV_DB_URL= development mongodb database url
$ STAGING_DB_URL= staging mongodb database url
$ PRODUCTION_DB_URL= production mongodb database url
$ JWT_SECRET_KEY= JWT secret for signing tokens