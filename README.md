# Au Open House Api


# List of Available APIS

## Student API


| Title | Method | URL | URL Params | Data Params |
|-------|:------:|:----|:----------:|:-----------:|
| Login | PUT | /login | - | idToken=[string] |
| Logout | GET | /logout | - | - |
| Get list of all faculties | GET | /faculties | - | - |
| Get faculty details | GET | /faculties/:faculty_id | faculty_id=[int] | - |
| Get list of all majors in the faculty | GET | /faculties/:faculty_id/majors | faculty_id=[int] | - |
| Get major details in the faculty | GET | /faculties/:faculty_id/majors/:major_id | faculty_id=[int]<br>major_id=[int] | - |
| Get list of upcoming events<br>(Before time start 1 hour and end time) | GET | /upevents | - | - |
| Get list of my events<br>(Student attend events) | GET | /myevents | - | - |
| Join the event | POST | /myevents/:event_time/join | event_time=[int] | - |
| Get list of all events | GET | /events | - | - |
| Get event details | GET | /events/:event_id | event_id=[int] | - |





usage example : https://auopenhouse.herokuapp.com/api/student/events


