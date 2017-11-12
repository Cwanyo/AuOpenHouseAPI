# Au Open House Api


# List of available apis

## Student API


| Title | Method | URL | URL Params | Data Params |
|-------|:------:|:----|:----------:|:-----------:|
| Student login | PUT | /login | - | sid=[string]<br>name=[string]<br>image=[string]<br>email=[string] |
| Get list of faculties | GET | /faculties | - | - |
| Get faculty details | GET | /faculties/:faculty_id | faculty_id=[int] | - |
| Get list of majors in the faculty | GET | /faculties/:faculty_id/majors | faculty_id=[int] | - |
| Get major details in the faculty | GET | /faculties/:faculty_id/majors/:major_id | faculty_id=[int]<br>major_id=[int] | - |
| Get list of events | GET | /events | - | - |
| Get event details | GET | /events/:event_id | event_id=[int] | - |




usage example : https://auopenhouse.herokuapp.com/api/student/events


