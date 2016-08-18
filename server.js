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
    completed: false
}];

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
	res.json(todos);
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

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '...');
});
