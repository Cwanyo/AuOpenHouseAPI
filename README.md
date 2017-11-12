# Au Open House Api


# List of available apis

## Student API


| Title | Method | URL | URL Params | Data Params |
|-------|:------:|:----|:----------:|:-----------:|
| Student login | PUT | /login | - | sid=[string]<br>name=[string]<br>image=[string]<br>email=[string] |
| Get the list of events | GET | /events | - | - |
| Get the event details | GET | /events/:event_id | event_id=[int] | - |
| Get the list of faculties | GET | /faculties | - | - |
| Get the faculty details | GET | /faculties/:faculty_id | faculty_id=[int] | - |




usage example : https://auopenhouse.herokuapp.com/api/student/events


