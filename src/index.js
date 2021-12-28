const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function getUser(username) {
  const userExists = users?.find((u) => u.username === username);

  return userExists;
}

function checksExistsUserAccount(request, response, next) {
  const userExists = getUser(request.headers.username);

  if (!userExists) {
    return response.status(400).send("user does not exists");
  }

  next();
}

app.post("/users", (request, response) => {
  let user = getUser(request.body.username);

  if (user) {
    return response.status(400).json({ error: true });
  }

  user = { ...request.body, id: uuidv4(), todos: [] };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const username = request.headers.username;

  const todos = users.find((u) => u?.username === username).todos;

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const username = request.headers.username;
  const userIndex = users.findIndex((u) => u.username === username);

  const { title, deadline } = request.body;

  const todo = {
    title,
    deadline: new Date(deadline),
    id: uuidv4(),
    done: false,
    created_at: new Date(),
  };

  users[userIndex].todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const todo = request.body

  const userIndex = users.findIndex((u) => u.username === username);
  const todoIndex = users[userIndex].todos.findIndex((td) => td.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: true });
  }

  users[userIndex].todos[todoIndex] = {
    ...users[userIndex].todos[todoIndex],
    ...todo
  };

  return response.status(200).json(users[userIndex].todos[todoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const userIndex = users.findIndex((u) => u.username === username);
  const todoIndex = users[userIndex].todos.findIndex((td) => td.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: true });
  }

  users[userIndex].todos[todoIndex] = {
    ...users[userIndex].todos[todoIndex],
    done: true,
  };

  return response.status(200).json(users[userIndex].todos[todoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const userIndex = users.findIndex((u) => u.username === username);
  const todo = users[userIndex].todos.find((td) => td.id === id);

  if (!todo) {
    return response.status(404).json({ error: true });
  }

  users[userIndex].todos = users[userIndex].todos.filter(
    (todo) => todo.id !== id
  );

  return response.status(204).json({});
});

module.exports = app;
