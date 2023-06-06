*****Please Add the mongoDB Url manually as there is some issue with mongoose throwing MongooseServerSelectionError*****

steps to start the server
1)npm i .
2)npm start

****http://localhost:4000/auth/google****
1) Visit the link and select the account of which you want to check the analytics.
2) Click on allow access in the prompt.
3) It will then redirect you to another link with access token in it. 

//Internal Api. Don't use this manually'\n'
****http://localhost:4000/google/redirect****
1) It will take some time to read the files in your drive.
2) After loading all the file and analysing the risk score, it will respond with something like this
Demo Response:-
[{"externallyShared":0},{"publicFiles":0},{"peopleWithAccess":0},{"RiskScore":"0"},{"PublicFiles":[]},{"ExternallyShared":[]}].

****http://localhost:4000/revoke/:email****
1) To revoke access you should pass the email in the api.
2) Then it clear the cookie containing the access token belonging to that email and also set that token to Inactive in Database as well.
