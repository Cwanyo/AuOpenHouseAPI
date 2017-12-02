# AU Open House API
This RESTful web services is a part of the term project that created by Assumption University students.

# Description
The RESTful web services that allow the clients to access the database information.

# List of Available API

For more information, check the [documentation](https://documenter.getpostman.com/view/3045264/collection/7E8hveG)

## Student API

URL : https://auopenhouse.herokuapp.com/api/student/

| Title | Method | URL | URL Params | Data Params |
|-------|:------:|:----|:----------:|:-----------:|
| Login | PUT | /login | - | idToken=[string] |
| Logout | GET | /logout | - | - |
| **ALL BELOW ROUTES REQUIRES USER AUTHENTICATION** |
| Get list of all faculties | GET | /faculties | - | - |
| Get faculty details | GET | /faculties/:faculty_id | faculty_id=[int] | - |
| Get list of all majors in the faculty | GET | /faculties/:faculty_id/majors | faculty_id=[int] | - |
| Get major details in the faculty | GET | /faculties/:faculty_id/majors/:major_id | faculty_id=[int]<br>major_id=[int] | - |
| Get list of upcoming events<br>(Between time start 2 hour and time end) | GET | /upevents | - | - |
| Get list of my events<br>(Student attended events) | GET | /myevents | - | - |
| Check event attendance | Get | /myevents/:time_id | time_id=[int] | - |
| Join the event | POST | /myevents/:time_id | time_id=[int] | - |
| Delete the event in my events | POST | /myevents/:time_id | time_id=[int] | - |
| Get list of all events | GET | /events | - | - |
| Get event details | GET | /events/:event_id | event_id=[int] | - |
| Get list of upcoming games<br>(Between time start and time end) | GET | /upgames | - | - |
| Get list of my games<br>(Student played games) | GET | /mygames | - | - |
| Play the game | POST | /mygames | - | answer=[json] |
| Get my games details | GET | /mygames/:game_id | game_id=[int] | - |
| Get total game points | GET | /mygames/points | - | - |
| Get list of all games | GET | /games | - | - |
| Get game details | GET | /games/:game_id | game_id=[int] | - |
| Get list of question in the game | GET | /games/:game_id/questions | game_id=[int] | - |
| Get list of answer choices in the game | GET | /games/:game_id/questions/:question_id/choices | game_id=[int]<br>question_id=[int] | - |


## Authority API

URL : https://auopenhouse.herokuapp.com/api/authority/

| Title | Method | URL | URL Params | Data Params |
|-------|:------:|:----|:----------:|:-----------:|
| Login | PUT | /login | - | idToken=[string] |
| Logout | GET | /logout | - | - |
| Request Account | PUT | /request | - | request=[json] |
| Get list of all faculties | GET | /faculties | - | - |
| Get list of all majors in the faculty | GET | /faculties/:faculty_id/majors | faculty_id=[int] | - |
| **ALL BELOW ROUTES REQUIRES STAFF AUTHENTICATION** |
| Get list of all events (According to state) | GET | /events/:state | state=[int] | - |
| Add new event | POST | /events | - | event=[json] |
| Edit event | PATCH | /events | - | event=[json] |
| Enable event | PATCH | /events/:event_id | event_id=[int] | - |
| Disable event | DELETE | /events/:event_id | event_id=[int] | - |
| Get event times | GET | /events/:event_id/times | event_id=[int] | - |
| Disable event times | DELETE | /events/:event_id/times/:time_id | event_id=[int]<br>time_id=[int] | - |
| Get list of event time attendees | GET | /events/:event_id/times/:time_id/attendees | event_id=[int]<br>time_id=[int] | - |
| Get list of all games (According to state) | GET | /games/:state | state=[int] | - |
| Add new game | POST | /games | - | game=[json] |
| Edit game | PATCH | /game | - | game=[json] |
| Disable game | DELETE | /games/:game_id | game_id=[int] | - |
| Get game questions | GET | /games/:game_id/questions | game_id=[int] | - |
| Delete game question | DELETE | /games/:game_id/questions/:question_id | game_id=[int]<br>question_id=[int] | - |
| Get questions choices | GET | /games/:game_id/questions/:question_id/choices | game_id=[int]<br>question_id=[int] | - |
| **ALL BELOW ROUTES REQUIRES ADMIN AUTHENTICATION** |
| Get list of all authorities account<br>(According to approval status) | GET | /authorities/:approval_status | approval_status=[int] | - |
| Set authority account approval status | PATCH | /authorities | - | authority=[json] |
| Delete authority account | DELETE | /authorities/:authority_id | authority_id=[int] | - |

# Architecture
- [Node.js](https://nodejs.org/en/) & [Express](https://expressjs.com/) - Web framework
- [Firebase](https://firebase.google.com/) - Used for authentication ([Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens))

# Contributors
- Pannachet Lertananta
- Rajanart Incharoensakdi
- Vorapat Phorncharroenroj
- Sai Kham Sheng
- Chatchawan Yoojuie
- Natthakul Boonmee
- Chinnawat Wongpatamajaroen