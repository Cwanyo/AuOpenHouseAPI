# Au Open House Api


# List of Available APIS

## Student API

<table>
    <thead>
        <tr>
            <th>Title</th>
            <th>Method</th> 
            <th>URL</th>
            <th>URL Params</th>
            <th>Data Params</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Login</td>
            <td>PUT</td> 
            <td>/login</td>
            <td>-</td>
            <td>idToken=[string]</td>
        </tr>
        <tr>
            <td>Logout</td>
            <td>GET</td> 
            <td>/logout</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <td colspan="5">-- ALL BELOW ROUTES REQUIRES USER AUTHENTICATION --</td>
        </tr>
        <tr>
            <td>Get list of all faculties</td>
            <td>GET</td> 
            <td>/faculties</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Get faculty details</td>
            <td>GET</td> 
            <td>/faculties/:faculty_id</td>
            <td>faculty_id=[int]</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Get list of all majors in the faculty</td>
            <td>GET</td> 
            <td>/faculties/:faculty_id/majors</td>
            <td>faculty_id=[int]</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Get major details in the faculty</td>
            <td>GET</td> 
            <td>/faculties/:faculty_id/majors/:major_id</td>
            <td>faculty_id=[int]<br>major_id=[int]</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Get list of upcoming events<br>(Between time start 1 hour and time end)</td>
            <td>GET</td> 
            <td>/upevents</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Get list of my events<br>(Student attended events)</td>
            <td>GET</td> 
            <td>/myevents</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Join the event</td>
            <td>POST</td> 
            <td>/myevents/:time_id/join</td>
            <td>time_id=[int]</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Get list of all events</td>
            <td>GET</td> 
            <td>/events</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Get event details</td>
            <td>GET</td> 
            <td>/events/:event_id</td>
            <td>event_id=[int]</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Get list of upcoming games<br>(Between time start and time end)</td>
            <td>GET</td> 
            <td>/upgames</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Get list of my games<br>(Student played games)</td>
            <td>GET</td> 
            <td>/mygames</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Play the game</td>
            <td>POST</td> 
            <td>/mygames/:game_id/play</td>
            <td>game_id=[int]</td>
            <td>points=[int]</td>
        </tr>
        <tr>
            <td>Get list of all games</td>
            <td>GET</td> 
            <td>/games</td>
            <td>-</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Get game details</td>
            <td>GET</td> 
            <td>/games/:game_id</td>
            <td>game_id=[int]</td>
            <td>-</td>
        </tr>
        <tr>
            <td>Get game questions and answers</td>
            <td>GET</td> 
            <td>/games/:game_id/questions</td>
            <td>game_id=[int]</td>
            <td>-</td>
        </tr>
    </tbody>
</table>

usage example : https://auopenhouse.herokuapp.com/api/student/events


