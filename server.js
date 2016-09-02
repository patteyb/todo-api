var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 4;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//---------------------------------------------------------------
// GET /todos?completed=false&q=work
app.get('/todos', function (req, res) {
	var query = req.query;
    var where = {};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
       where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
       where.task = { $like: '%' + query.q + '%' };
    } 

    db.todo.findAll({where: where}).then(function(todos) {
        res.json(todos);
    }, function(e) {
        res.status(500).send();
    })
});
          


//----------------------------------------------------------------
// GET /todos/:id
app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	
    db.todo.findById(todoId).then(function (todo) {
        if (!!todo) { // double exclamations means if todo exists
            res.json(todo.toJSON());
        } else {
		    res.status(404).send();
        }
	}, function (e) {
		res.status(500).send(); // server error
	});
});

//----------------------------------------------------------------
// POST /todos
app.post('/todos', function (req, res) {
    // Keep only the fields we want
	var body = _.pick(req.body, 'task', 'completed');

    db.todo.create(body).then(function (todo) {
		res.json(todo.toJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});

//----------------------------------------------------------------
// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {id: todoId }
    }).then( function(numDeletions) {
        if (numDeletions === 0) {
            res.status(404).json({
                error: 'No todo with that id'
            });
        } else {
            res.status(204).send();
        }
    }, function() {
        res.status(500).send(); // server error
    });
});

//----------------------------------------------------------------
// UPDATE a task
app.put('/todos/:id', function(req, res) {
    var body = _.pick(req.body, 'task', 'completed');
    var todoId = parseInt(req.params.id, 10);
    attributes = {};
     
    if(body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('task')) {
        attributes.task = body.task;
    }

    db.todo.findById(todoId).then(function(todo) {
        if (todo) {
            todo.update(attributes).then( function(todo) {
                res.json(todo.toJSON());
            }, function(e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    });
});

/* USER FUNCTIONS ----------------------------------------------------- */

// POST /user
app.post('/users', function (req, res) {
    // Keep only the fields we want
	var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function (user) {
		res.json(user.toPublicJSON());
	}, function (e) {
		res.status(400).json(e);
	});
});

db.sequelize.sync().then(function() {
    app.listen(PORT, function () {
	    console.log('Express listening on port ' + PORT + '...');
    });
});

