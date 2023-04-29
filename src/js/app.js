import TaskList from './taskList.js';

const taskList = document.querySelector('.task-widget');
const taskListClass = new TaskList(taskList);

taskListClass.init();
