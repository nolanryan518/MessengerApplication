University of Dayton

Department of Computer Science

CPS 490 - Capstone I, Fall 2020

Instructor: Dr. Phu Phung


## Capstone I Project 


# The Messenger Application


# Team members - Team #7

1.  Chase Hensley <hensleyc2@udayton.edu>
2.  Nolan Hollingsworth <hollingsworthn2@udayton.edu>
3.  Roberto Valadez <valadezjrr1@udayton.edu>
4.  Andrew Streng <strenga1@udayton.edu>


# Project Management Information 

Messenger: <https://messenger-cps490-team7.herokuapp.com/>

## Revision History

| Date     |   Version     |  Description |
|----------|:-------------:|-------------:|
|MM/DD/YYYY|  0.0          | Init draft   |
|09/04/2020|  0.1          | Chase added his User Requirements   |
|09/09/2020|  0.2          | Roberto added his User Requirements   |
|09/09/2020|  0.3          | Nolan added his User Requirements   |
|09/09/2020|  0.4          | Andrew added his User Requirements  |
|10/05/2020|  1.0          | Sprint 1 completion, first official working version of application  |
|10/27/2020|  2.0          | Sprint 2 Completion, multiple group chats and mogodb integration    |
|12/1/2020|  3.0          | Sprint 3 Completion, read/load from mogodb and UI rework    |

# Overview

A system that allows the User to be able to send messenges to other Users.

![The System Architecture](/images/Architecture.png/)

System communicates data retrieval and mainpulation between the Server Application and the Computer/Phone Browsers that are being used. 

# System Analysis

## User Requirements

List of high-level requirements of the project that our team is developing throughout the project:

-Send Group Messages: User can type text and send to a group.

-User Registration: User can register to the system. 

-Send Private Messages: Users can type text and send to a single receiver.

-Received Messages: Users can see if the sent messages have been read.

-Message Status: Check to see if message has been read/delivered

-Message Storage: How large the message is

-Message Delivery Notification: User is notified the message was sent

-View Message History: User can view the message history

-Server Invitation Notification: User is notified of invite to Server

-Change Profile Picture: User can change the profile picture at his choosing.

-Change Group Picture: Admin can change the Group picture.


# Use cases

![UseCaseDiagram](/images/UseCaseDiagram.PNG/)

1. Use Case: User Registration
	* Actor: Unregistered User
	* User Story: As an Unregistered User, I want to register an account for this Messenger app, so that I can communicate with fellow individuals I know who use the app.
	* Use Case Description: Actor enters new account data, system assigns new account ID to to Actor, creates new account record.

2. Use Case: Send Group Messages
	* Actor: Registered User
	* User Story: As Registered User, I want to send group messages to a select group, so that I can communicate en mass with fellow group/work members. 
	* Use Case Description: User selects group they are, types message into group chat, system send copies of message to each member in the group. 

3. Use Case: Send Private Messages
	* Actor: Regiestered User
	* User Stories: As a Registered User, I want to send a private messges to other users.
	* Breif Use Case Description: Able to send a Private Messages to a User. Being able to send to a private group.

4. Use Case: View Received Messages
	* Actor: Regiestered User
	* User Stories: As a Registered User, I want to be able to view all received Messages sent to me.
	* Breif Use Case Description: Able to see a history of all the messages sent to the users.

5. Use Case: View Message History
    * Actor: Registered User
    * User Stories: As a registered user I want to view previous messages sent in the group/private conversations as to check over any important information shared
    * Brief Use Case Description: User accesses the conversation they want to access, server retrieves and displays previous conversation messages

6. Use Case: View Message Status
    * Actor: Registered User
    * User Stories: As a registered User, I want to be able to see the status of my message in comparison to other users. Whether it has been read by others or delievered.
    * Brief Use Case Description: User is able to tell the status of message to other users. Other users must provide a status with incoming messages.

7. Use Case: View Message Storage
    * Actor: Registered User
    * User Stories: As a registered User, I want to be able to tell how much storage a message takes. 
    * Brief Use Case Description: The request of the selected message is sent to the server, which in turn lists the size of the message that was just received.

8. Use Case: View Message Delivery Notification
    * Actor: Registered User
    * User Stories: As a registered user, I want to know when my message is sent to other person(s) so that I know it was received
    * Brief Use Case Description: User enters and delivers messages, the message gets received by the server, server then pushes a notification that the message was delivered.
9. Use Case: Server Invitation Notification
    * Actor: Registered User
    * User Stories: As a registered user, I want to invite other users to a private server
    * Brief Use Case Description: User accepts invitation, added to server member list.

10. Use Case: Group/User Profile Picture
    * Actor: Registered User
    * User Stories: As a registered user, I want to change my profile picture/group picture
    * Breif User Case Description: User can change his group picture and/or his user profile picture.


# Sequence Diagrams
![Login](/images/Login.PNG/)
![Send_Message](/images/Send_Message.PNG/)
![Delivery_Notification](/images/Delivery_Notification.PNG/)
![LoadChat](/images/LoadChat.PNG/)
![StoreChat](/images/StoreChat.PNG/)
![ServerInvite](/images/ServerInvite.PNG/)

# System Design

![System_Design](/images/System_Design.PNG/)

## Use-Case Realization

- Login Code chatserver.js
![Login1](/images/CodeSnippets/Login1.PNG)
![Login2](/images/CodeSnippets/Login2.PNG)
![Login3](/images/CodeSnippets/Login3.PNG)

- Add Server to database messengerdb.js
![AddServertodatabase](/images/CodeSnippets/AddServertodatabase.PNG)

- Enter Server chatserver.js
![EnterServer1](/images/CodeSnippets/EnterServer1.PNG)
![EnterServer2](/images/CodeSnippets/EnterServer2.PNG)

- Load/Store Chat messengerdb.js
![LoadStoreChat](/images/CodeSnippets/LoadStoreChat.PNG)
## Database 

There are mulitply collections depending on how many servers.There are two main collentions, one is for the public_chat and the other one is for the users.
There can be many types of these next two. There is one for group servers created and then one for the direct messages.

Users

1. _id
2. username
3. password
4. serverList
5. image

public_chat

1. _id
2. receiver
3. message

Group Server

1. _id
2. owner
3. memberList
4. imageSource
5. id
6. receiver
7. message

Direct Message

1. _id
2. receiver
3. message


## User Interface

In Sprint 1 we created a Log in Interface where the user can add enter their name and join the messenger chat. After being added to the mesenger chat public chat, they can choice to look at the
public chat or the private chat. They will have to add the username that they want to be able to send the private message before sending it.

1. Login UI
2. Public chat UI
3. Private chat UI
4. UserList UI

In Sprint 2 we made improvements to some of the Sprint 1 User Interfaces. Then we added some new Interfaces such the group UI. This UI can show the users names and chat.
We also have added a Regristration UI. User can create a Password and Username. 

1. Regristration UI
2. Group chat UI

In Sprint 3 we made improvments to the Sprint 1 & Sprint 2 User Interfaces. Then we added some new Interfaces for the Users Profile. This will show you 
what server the users is in. Also We added new UI for Joining and making a server.

1. Regristrations UI
2. Group chat UI
3. Public chat UI
4. Private chat UI
5. User Profile UI
6. Notification UI

# Implementation

## Sprint 1

For implementation we split our group of four into two groups of two - Chase, Roberto - Nolan, Andrew - and we split up
the responsibilities of each group. Chase and Roberto are group 1 and focused more on the front end of things, while Nolan and Andrew are group 2 and are focused on the
back-end implementation. We came together as a group every week day for atleast 15 minutes to discuss where we were in our miny groups and see if any of us needed
help implementing or testing anything. Our group really focused on a collaborative approach. 

For testing our web-app we would get a couple of us together whenever we felt as if we finished implementing something new and we would try and break our 
implementation. As a group we decided that we wanted to bug test as much as we could during each implementation of a new function in our web-app. Doing this allowed all of us
to be able to understand the code better as we went along as a group and understand the direction we want to take our project.

For our app we are using HTML, CSS, and JavaScript for our layout, design, and function of our messaging web-app.

## Sprint 2
In Sprint 2, we continued the sub-team approach, with Roberto and Chase working on the Front End and Andrew and Nolan working on the backend. For our implementation, we also redid 
our previous private chat approach. Instead of it being just a 1-1 private message, we can now have more than one user. In fact, we created an interactive way to add users to our server
by having each user be a single button. And upon this button click, an inviation is sent to the user. We started small with only one group chat, then gradually increased to where a user can be a
part of many different servers and only receive messages according to the server they are currently in. We also connected our chat users to our mongodb database. With this, this ensures only authorized
clients our using our chat server. 

## Sprint 3
In Sprint 3, We split our jobs into 3 groups. Nolan and Andrew working on the CSS and two more use cases of our choice. Roberto
working on Storing/Loading private and group chat messages from the database. While chase worked on bug fixes from sprint 2 and finished up some old requirements.
We redid the UI for a lot of segments of the messenger. We added a profile tab to see mutual severs. We also divided the group chats from the direct messages.


## Deployment

We used heroku to deploy our app. Heroku is an online small-app hosting site that we felt was the right fit for our messenger app. We have multiple packages that we used to develop our app. Those packages being mongodb, socket.io, express, jquery, jsdom, multer, and request.

# Software Process Management

Team 7 collaborates primarily through utilization of the communication app known as Discord, as it is used to communicate our ideas, intentions/objectives of each member during our work cycles, and is the primary source of our chat meetings. 
Our group tends to meet MW starting at 5pm,going until we our content with our progress, and TRF 3:30pm-4:00pm to discuss objectives and tasks to be acocmplished within each sprint. Weekends are considered times where we meet when we can and do work throughout until the beginning of the following week.
We determine our goals first, do intial programming, test the code, and make revisions until the code works. ONly then do we format and organize the documents and touch-up anything else that is needed. 

![Trello Board](/images/TrelloBoard1.png/)

![Gannt Chart](/images/Gannt_Chart.png/)


## Scrum process

### Sprint Timelines

Sprint0: 08/27/2020-09/10/2020

Sprint1: 09/10/2020-10/06/2020

Sprint2: 10/06/2020-10/27/2020

Sprint3: 10/29/2020-12/01/2020


#### Completed Tasks: 
Sprint 1
1. Created a working private chat: users can send private messages between each other.
2. Made typing events. It will display when a user is typing.
3. Developed a way to maintain all connected users on the server.

Sprint 2:
1. Imroved Private chat from 1-1 message basis to a group chat capabilities. 
2. Made server invitation event
3. Integrated our registered user with our mongodb database.

Sprint 3:
1. Stored public and private chats to mongodb database.
2. Updated entire CSS
3. Updated Server creation
4. Profile Images
5. Group chat Image

#### Contributions: 

Sprint 0

1.  Roberto Valadez: 4 hours, created use case diagrams, provided user requirements, made use cases
2.  Andrew Streng: 4 hours, provided user requirements, made use cases
3.  Nolan Hollingsworth: 4 hours, provided user requirements, made use cases
4.  Chase Hensley: 4 hours, created use case diagrams, provided user requirements, made use cases, formatted README.md file

Sprint 1

1.  Roberto Valadez: 9 hours, CSS creation, typing event, adhcoc bug testing, front end.
2.  Andrew Streng: 12 hours, private chat, typing events, time event, back end, adhoc bug testing.
3.  Nolan Hollingsworth: 9 hours, created Login, privatechat, disconnect, back end, adhoc bug testing.
4.  Chase Hensley: 7 hours, formatted README.md file further, typing event, front end, adhoc bug testing in index.html and chatserver.js files.

Sprint 2

1.  Roberto Valadez: 11 hours, mongodb integration, registration/login screen development, bug testing
2.  Andrew Streng: 18 hours, private chat development, bug testing
3.  Nolan Hollingsworth: 14 hours, private chat development, CSS
4.  Chase Hensley: 8 hours, bug testing, merging of front/back end

Sprint 3

1.  Roberto Valadez: 15 hours, mongodb integration, small UI changes, bug testing, and readme
2.  Andrew Streng: 20 hours, UI overhaul, readme, helped with mongodb
3.  Nolan Hollingsworth: 16 hours, UI overhaul, deployment, bug testing
4.  Chase Hensley: 12 hours, UI improvements with chat servers, bug testing.

#### Sprint Retrospective:
Sprint 1:
During this first Sprint, our team has accomplished quite a bit. Coming from practically no experience with the languages involved, we are very happy with the current product we have developed. After
reviewing the details of this Sprint, we will break the overall performance down into two parts: What we did well and things we can improve on (including current implementations).

What we did well:
Design:
    
    1) We have provided a working interface for a messenger application.

Team Dynamics:
 
    1) We believe the way we have distributed the work throughout team members(i.e front/back end) has really helped with overall progress.
 
    2) We have worked really well together as a team. We encouraged each other to work hard each member has an equally valid opinion on matters, created a balanced and friendly work environment.
    
What we can improve on:
Design:

    1)We would like to display when a user is sending a private message. For example, instead of saying 'X' is typing when they're sending a private message, we want to show 'X' is sending 'you' a private message,
    where 'you' is the person who will receive the private message.
    
    2)Our current time use case is a little shakey. We would like to figure out a system where the time is calculated client-based instead of server-based, so we do not have to account for various time zones.
   
    3)Another current problem we are having is with our private chat sending private messages to all users in private chat. This is a simple fix: we just need to emit only to the private user, not every user.
       We noticed this error after deploying and have decided to fix it at a later time.

Time Management: 
 
    1)We have found that we have run into last minute situations. We would like to better manage our time in order to prioritize quality of features and design to improve our overall product, 
      not just deadlines. We can solve this by committing to work for a specific period of time per day. 

Sprint 2:
During this Sprint, our team has further developed our chat server in order to accomodate multiple users wishing to privately chat. We feel we are beginning to get mroe comfortable with socketio
and with mongodb. Given this, we are looking forward to what we can accomplish within the final Sprint. 

What we did well:
Design:
    
    1) A clear separation between multiple elements in our chat server
    
    2) We have implemented well the ability to register users, thus giving us an efficient way to monitor users.
Team Coordination:
    
    1) We continued our sub group approach allowing us certain members to put full attention into specific areas. 
    
What we can improve on:
    Design: 
    
    1) Continue to improve upon the appearance
    
    2) There are a few functional limitations we would like to try and overcome. For example, in our chat server, you can only create 1 server at a time. So two users couldn't simultaneously 
        press create server at the same time. We believe over time we can solve this

Sprint 3:
This final sprint was just a bug fixing sprint with some finishing touches. 

What we did well:
Design:
    
    1) A new separation between the elements in our chat server
    
    2) New Notification UI
    
    3) A new create server

Team coordination:
    
    1) We used subgroups to attack the major parts of this sprint while the others focused on small bug fixes and features.

What we can improve on:
    
    1) Continue to improve upon the appearance
    
    2) Creating the same name for different servers
    
    3) loading profile pictures with history of chat
    
    4) One problem with our messenger that we ran into is images not translating across sessions. Initially we tried to solve this problem by saving user uploaded images 
    to our server files using Multer, but ultimately we did not have enough time to get it to work, therefore images are tied to the session only.
 
# User guide/Demo
### Step 1
- Register and log in

![Demo Step 1](/images/demo/STEP1.png/)
### Step 2
- Send a message

![Demo Step 2](/images/demo/STEP2.png/)


### Step 3
- create a group message

![Demo Step 3](/images/demo/STEP3.png/)



### Step 4
- invite a user

![Demo Step 4](/images/demo/STEP4.png/)

- Or use side menu by clicking user and invite to server

![Demo Step 4.5](/images/demo/STEP4.5.png/)


### Step 5
- customize profile: edit username, profile picture

![Demo Step 5](/images/demo/STEP5.png/)
