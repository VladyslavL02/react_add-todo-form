import './App.scss';

import usersFromServer from './api/users';
import todosFromServer from './api/todos';
// eslint-disable-next-line import/no-extraneous-dependencies
// import _ from 'cypress/types/lodash';
import cn from 'classnames';
import React, { useState } from 'react';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
  user: User | null;
}

const defaultTodos: Todo[] = todosFromServer.map(todo => {
  return {
    ...todo,
    user: usersFromServer.find(user => user.id === todo.userId) || null,
  };
});

const DEFAULT_TITLE_VALUE: string = '';
const DEFAULT_SELECTED_USER: number = 0;
const DEFAULT_SELECT_USER_ERROR: boolean = false;
const DEFAULT_SELECT_TITLE_ERROR: boolean = false;
const ALLOWED_CHARACTERS: RegExp = /[^a-zA-Zа-яА-ЯіІїЇєЄ0-9\s]/g;

function getMaxId(todos: Todo[]) {
  let maxId = -1;

  todos.map(({ id }) => {
    if (id > maxId) {
      maxId = id;
    }
  });

  return maxId;
}

export const App = () => {
  const [newTodoTitle, setNewTodoTitle] = useState<string>(DEFAULT_TITLE_VALUE);
  const [selectedUser, setSelectedUser] = useState<number>(
    DEFAULT_SELECTED_USER,
  );
  const [todos, setTodos] = useState<Todo[]>(defaultTodos);
  const [maxId, setMaxId] = useState<number>(getMaxId(todos));
  const [selectUserError, setSelectUserError] = useState<boolean>(
    DEFAULT_SELECT_USER_ERROR,
  );
  const [selectTitleError, setSelectTitleError] = useState<boolean>(
    DEFAULT_SELECT_TITLE_ERROR,
  );

  if (newTodoTitle !== DEFAULT_TITLE_VALUE && selectTitleError === true) {
    setSelectTitleError(DEFAULT_SELECT_TITLE_ERROR);
  }

  if (selectedUser !== DEFAULT_SELECTED_USER && selectUserError === true) {
    setSelectUserError(DEFAULT_SELECT_USER_ERROR);
  }

  const handleSetNewTitleValue = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNewTodoTitle(event.target.value.replace(ALLOWED_CHARACTERS, ''));
  };

  const handleTodoSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (
      newTodoTitle === DEFAULT_TITLE_VALUE &&
      selectedUser === DEFAULT_SELECTED_USER
    ) {
      setSelectTitleError(true);
      setSelectUserError(true);

      return;
    }

    if (newTodoTitle === DEFAULT_TITLE_VALUE) {
      setSelectTitleError(true);

      return;
    }

    if (selectedUser === DEFAULT_SELECTED_USER) {
      setSelectUserError(true);

      return;
    }

    const newTodo: Todo = {
      id: maxId + 1,
      title: newTodoTitle,
      completed: false,
      userId: selectedUser,
      user: usersFromServer.find(({ id }) => id === selectedUser) || null,
    };

    setTodos([...todos, newTodo]);
    setMaxId(maxId + 1);
    setNewTodoTitle(DEFAULT_TITLE_VALUE);
    setSelectedUser(DEFAULT_SELECTED_USER);
    setSelectTitleError(DEFAULT_SELECT_TITLE_ERROR);
    setSelectUserError(DEFAULT_SELECT_USER_ERROR);
  };

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form action="/api/todos" method="POST">
        <div className="field">
          <label htmlFor="titleInput">Title:</label>
          <input
            id="titleInput"
            type="text"
            data-cy="titleInput"
            value={newTodoTitle}
            onChange={handleSetNewTitleValue}
            placeholder="Enter a title"
          />
          {selectTitleError && (
            <span className="error">Please enter a title</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="userSelect">User:</label>
          <select
            id="userSelect"
            data-cy="userSelect"
            onChange={event => {
              setSelectedUser(+event.target.value);
            }}
            value={selectedUser}
          >
            <option value="0" disabled>
              Choose a user
            </option>
            {usersFromServer.map(({ id, name }) => (
              <option value={id} key={id}>
                {name}
              </option>
            ))}
          </select>

          {selectUserError && (
            <span className="error">Please choose a user</span>
          )}
        </div>

        <button type="submit" data-cy="submitButton" onClick={handleTodoSubmit}>
          Add
        </button>
      </form>

      <section className="TodoList">
        {todos.map(({ id, completed, title, user }) => (
          <article
            data-id={id}
            className={cn('TodoInfo', {
              'TodoInfo--completed': completed,
            })}
            key={id}
          >
            <h2 className="TodoInfo__title">{title}</h2>

            <a
              className="UserInfo"
              href={`mailto:${user?.email || 'No_email'}`}
            >
              {user?.name || 'No user'}
            </a>
          </article>
        ))}
      </section>
    </div>
  );
};
