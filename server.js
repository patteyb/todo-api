var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 4;

// For Testing
todos = [{
    id: 1,
    task: "Wash the dogs",
    completed: false
}, {
    id: 2,
    task: "Laundry",
    completed: false
}, {
    id: 3,
    task: "Do homework",
    completed: true
}];

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

// GET /todos?completed=false&q=work
app.get('/todos', function (req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {completed: true});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {completed: false});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function (todo) {
			return todo.task.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}

	res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
});

// POST /todos
app.post('/todos', function (req, res) {
    // Keep only the fields we want
	var body = _.pick(req.body, 'task', 'completed');
  
	if (!_.isBoolean(body.completed) || !_.isString(body.task) || body.task.trim().length === 0) {
		return res.status(400).send();
	}
    
    // normalize incoming data
    body.task = body.task.trim();

	// add id field
	body.id = todoNextId++;

	// push body into array
	todos.push(body);
	
	res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo) {
        todos = _.without(todos, matchedTodo);
        // this call to json will send along a status=200 as well
        res.json(matchedTodo);
	} else {
		res.status(404).json({"error": "No todo found with that id"});
	}
});

// UPDATE a task
app.put('/todos/:id', function(req, res) {
    var body = _.pick(req.body, 'task', 'completed');
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    
    // If no record matches id
    if (!matchedTodo) {
		return res.status(404).send();
	};
    
    // Keep only the fields we want
	var body = _.pick(req.body, 'task', 'completed');
    var validAttributes = {};
    validAttributes.id = todoId;
    
    if(body.hasOwnProperty('task') && _.isString(body.task) && body.task.trim().length > 0) {
        validAttributes.task = body.task.trim();
    } else {
        //Never provided valid attribute
        return res.status(400).send();
    };
    
    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        // has property but it's not boolean
       validAttributes.completed = false;
    } else {
        //Never provided attribute, no problem
        validAttributes.completed = false;
    };
 
	// Everything is good, so update fields
    // objects are passed by reference, so this 
    // updates the actual object
    _.extend(matchedTodo, validAttributes);
    
    // this has to be here or postman hangs
    res.json(matchedTodo);

});



app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '...');
});
