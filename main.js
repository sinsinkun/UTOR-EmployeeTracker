const inquirer = require('inquirer');
const db = require('./mysql-connect')('company_db','password');
const consoleTable = require('console.table');

async function main() {

  let repeat = true;

  while (repeat) {
    // ask for a task
    const task = await inquirer.prompt([
      {
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View existing data','Edit existing data','Remove existing data','Insert something new'],
        name: 'choice'
      },
      {
        type: 'list',
        message: 'For which of the below?',
        choices: ['Departments','Roles','Employees'],
        name: 'table'
      }
    ])

    // if viewing existing data
    if (task.choice === 'View existing data') {

      let res = '';
      switch (task.table) {
        case 'Departments':
          res = await db.query(`select departments.department from departments`);
          break;
        case 'Roles':
          res = await db.query(`select roles.title, roles.salary, departments.department from 
          roles left join departments on departments.id = roles.department_id;`);
          break;
        case 'Employees':
          res = await db.query(`select employees.id, employees.first_name, employees.last_name, roles.title, 
          roles.salary, employees.manager_id, departments.department from employees left join roles on 
          roles.id = employees.role_id left join departments on roles.department_id = departments.id;`);
          let managerNames = res.map(employee => {
            if (employee.manager_id === null) return null;
            else return db.query(`select first_name, last_name from employees where employees.id = ${employee.manager_id};`);
          })
          managerNames = await Promise.all(managerNames);
          for (let i=0; i<res.length; i++) {
            delete res[i].manager_id;
            if (managerNames[i] === null) res[i].manager = 'n/a';
            else res[i].manager = `${managerNames[i][0].first_name} ${managerNames[i][0].last_name}`;
          }
      }
      console.table(res);

    }
    // if editing existing data
    else if (task.choice === 'Edit existing data') {

    }
    // if removing existing data
    else if (task.choice === 'Remove existing data') {

    }
    // if adding existing data
    else if (task.choice === 'Insert something new') {

    }

    // exit loop
    const exit = await inquirer.prompt([
      {
        type: 'list',
        message: 'Would you like to perform another action?',
        choices: ['Yes','No'],
        name: 'choice'
      }
    ])
    if (exit.choice === 'No') repeat = false;
  }
  // exit database
  db.close();
}

main();