'use strict';

module.exports = function(app) {
    var auopenhouse = require('../controllers/auopenhouseController');

    // auopenhouse Routes

    /*app.route('/tasks')
        .get(todoList.list_all_tasks)
        .post(todoList.create_a_task);


    app.route('/tasks/:taskId')
        .get(todoList.read_a_task)
        .put(todoList.update_a_task)
        .delete(todoList.delete_a_task);*/

    app.route('/getName/:userId')
        .get(auopenhouse.read_a_user);


}