# TBA Recipe App Documentation

## Overview:

This is a project for a dictionary-like application for recipes. Offers functionalities for users to log in and create their own recipes and submit to the database. Additionally, users may browse the existing recipes in the database and submit ratings.The front end supports fully displaying the total time, and the yield of the recipe. The author field however does not have functionality associated with it. In addition, the ingredient field and directions will display if those fields are added to the database. The Creamy Chickpea Pasta With Spinach and Rosmary Recipe is a good example of how the recipe will display when the fields of the recipe are filled out. Our database supports the addition of the users from the backend, but authentication of the user is actually supported by the userbase.com free tier.

Test Username: the cat
Test Password: catcatcat


## Start Guide:
Our backend is hosted on Heroku:
https://recipe-app-tba.herokuapp.com/recipe
https://recipe-app-tba.herokuapp.com/user

The front end is hosted on glitch 
https://recipe-app-tba.glitch.me 
https://glitch.com/edit/#!/recipe-app-tba 



## Front-end:

Framework & language: Mithril.js, JavaScript
User authentication service: Userbase

To have your own version of the front end simply remix the app on glitch. If deploying a new backend API_SERVER will have to be changed to your own web hosted backend.


Api doc:

Api.getRecipes(): returns a collection of recipes in the database
Api.getRecipe(id): returns a specific recipe based on its id
Api.addRecipe(recipe): Add new recipe object to the database
Api.updateRecipe(recipe): Update a recipe in the database
Api.deleteRecipe(recipe): Delete a recipe from the database
Api.getUsers(): returns a collection of users in the database
Api.getUser(id): returns a specific user based on its id
Api.addUser(user): Add new user object to the database
	The Api.addUser however does not work correctly. While all other database operations work correctly this one will return a 404 error when attempted. User’s however can be added from the backend.
Api.updateUser(user): Update a user in the database
Api.deleteUser(user): Delete a user from the database

In addition Userbase supports the methods at the following link:
https://userbase.com/docs/sdk/ 



## Back-end:

Framework & language: Gradlew, Java

Heroku Deployment:
The back-end of this application is running on Heroku which is a cloud platform supporting multiple languages for developers to build and run their apps. The deployment for Heroku platform is quite handy with .git support natively. Some detailed steps are listed below:
Navigate to https://www.heroku.com, sign up or sign in with your existing project account.
Create an app or open an existing app on your dashboard and follow the documentations provided to install the Heroku CLI client if you do not have one, make sure git is enabled for your local project.
Select the corresponding language for the project, Java for this project. Then follow the instructions to create an app or push an existing project onto the server with ‘git push heroku master’ command.
Take down the project domain which can be located under the ‘Settings’ tab.
Connect front-end with back-end by setting the API_SERVER to be the project domain in the web app.


Database: MongoDB
For this APP we used a mongoDB database. This is a no-sql database format that can closely follow the Class model for storage. 
To deploy the database first go to  https://www.mongodb.com/cloud/atlas and sign up for a free database cluster. 
Once signed up log into the database cluster.
On the logged in page in the sign in bar click database access and create a new database user. This makes the username and password for this database user whatever you want. You will need this information for the deployment of the database to heroku.
Next go to network access and click in the corner the add ip address and click whitelist all addresses or type in the address 0.0.0.0. (This also whitelists all IP addresses).
Click on cluster in the sidebar and then on the cluster you want to add the heroku connection click connect copy the connection string.
Now go to the heroku website and then navigate to the app.
In the app dashboard go to settings. 
Under settings add  the config variable with the key MONGODB_URI and the value as the connection string you copied. But instead of <Username> and <Password> in the connection string replace it with the database username and password you created earlier.
After that you should be done deploying the altas mongoDB database to Heroku.

You can also probably deploy the database using mLabs but this is the way we deployed our database.

The back end has 5 main models associated with it 
Direction
Ingredient
Rating
Recipe
User

The UML for the backend is as follows. A link also because the UML is rather small 
https://www.lucidchart.com/invitations/accept/33d268b1-7268-4736-93a1-62cc1a1a12ee



Design Decisions:
All times in the backend should be stored in seconds.
Measurements in the units they are received.
Linked to full design decisions
https://docs.google.com/document/d/17c5W77Lbxso7QB4kkXmBQiKCB1WvIp8W2E4Qojm6A5s/edit 



## Todos & improvements:
Implement the functionality to connect users with the backend (Add to database when registered, achieve data when logged in).
Create new Apis for Ratings on the backend for comments from the user.
Optimize the front-end ui, suggest drop down lists for ratings and styles.
Create a form for filling out directions and ingredients for a recipe. Would have to be dynamic because recipes have multiple directions and ingredients
Api for users to be able to favorite recipes and a place for them to see their favorited recipes.
User profile page that has preferences for how how time, measurement should display when they visit the site.



## Build instructions

A recent Gradle (>= 6.1.1 but < 7.0.0) and JDK 8.

* Building

`./gradlew build`

* Testing

`./gradlew test`

* Running

`./gradlew run`

The server will start on port 5000 by default.

* Deploying to Heroku

Configure as normal and use `git push heroku master`.

`./gradlew build deployHeroku` works to deploy without pushes...sometimes.

* Spotless?

Spotless automatically formats code. If it detects errors, run `./gradlew spotlessApply`
to automatically fix them. `./gradlew spotlessCheck` can be used to directly invoke
Spotless.