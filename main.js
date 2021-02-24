const inquirer = require('inquirer');
const db = require('./mysql-connect')('company_db', 'password');
const consoleTable = require('console.table');

async function main() {

  let repeat = true;

  while (repeat) {
    // ask for a task
    const task = await inquirer.prompt([
      {
        type: 'list',
        message: 'What would you like to do?',
        choices: ['View existing data', 'Edit existing data', 'Remove existing data', 'Add new data'],
        name: 'choice'
      },
      {
        type: 'list',
        message: 'For which of the below?',
        choices: ['Departments', 'Roles', 'Employees'],
        name: 'table'
      }
    ])

    // if viewing existing data
    if (task.choice === 'View existing data' && task.table === 'Departments') console.table(await viewDepartments());
    else if (task.choice === 'View existing data' && task.table === 'Roles') console.table(await viewRoles());
    else if (task.choice === 'View existing data' && task.table === 'Employees') console.table(await viewEmployees());
    // if editing existing data
    else if (task.choice === 'Edit existing data' && task.table === 'Departments') editDepartments();
    else if (task.choice === 'Edit existing data' && task.table === 'Roles') editRoles();
    else if (task.choice === 'Edit existing data' && task.table === 'Employees') editEmployees();
    // if removing existing data
    else if (task.choice === 'Remove existing data' && task.table === 'Departments') removeDepartment();
    else if (task.choice === 'Remove existing data' && task.table === 'Roles') removeRole();
    else if (task.choice === 'Remove existing data' && task.table === 'Employees') removeEmployee();
    // if adding existing data
    else if (task.choice === 'Add new data' && task.table === 'Departments') addDepartment();
    else if (task.choice === 'Add new data' && task.table === 'Roles') addRole();
    else if (task.choice === 'Add new data' && task.table === 'Employees') addEmployee();

    // exit loop
    const exit = await inquirer.prompt([
      {
        type: 'list',
        message: 'Would you like to perform another action?',
        choices: ['Yes', 'No'],
        name: 'choice'
      }
    ])
    if (exit.choice === 'No') repeat = false;
    console.log('');
  }
  // exit database
  db.close();
}

main();

async function viewDepartments() {

  let res = await db.query(`select departments.department from departments`);
  // find number of employees in each role
  salaryArr = await db.query(`select departments.department, roles.salary 
    from employees left join roles on employees.role_id = roles.id
    left join departments on roles.department_id = departments.id;`);
  // add total utilized budget per department
  for (let i = 0; i < salaryArr.length; i++) {
    for (let j = 0; j < res.length; j++) {
      if (salaryArr[i].department === res[j].department && res[j].utilized_budget === undefined) res[j].utilized_budget = salaryArr[i].salary;
      else if (salaryArr[i].department === res[j].department) res[j].utilized_budget += salaryArr[i].salary;
    }
  }

  return res;
}

async function viewRoles() {
  const res = await db.query(`select roles.title, roles.salary, departments.department 
  from roles left join departments on departments.id = roles.department_id;`);
  return res;
}

async function viewEmployees() {
  let res = await db.query(`select employees.id, employees.first_name, employees.last_name, roles.title, 
    roles.salary, employees.manager_id, departments.department from employees left join roles on 
    roles.id = employees.role_id left join departments on roles.department_id = departments.id;`);
  // second query to find manager names
  let managerNames = res.map(employee => {
    if (employee.manager_id === null) return null;
    else return db.query(`select first_name, last_name from employees where employees.id = ${employee.manager_id};`);
  })
  managerNames = await Promise.all(managerNames);
  for (let i = 0; i < res.length; i++) {
    delete res[i].manager_id;
    // add manager names to res
    if (managerNames[i] === null) res[i].manager = 'n/a';
    else res[i].manager = `${managerNames[i][0].first_name} ${managerNames[i][0].last_name}`;
  }
  return res;
}

async function editDepartments() {
  let departmentsArr = await db.query(`select departments.department from departments`);
  departmentsArr = departmentsArr.map(arr => arr.department);

  const edit = await inquirer.prompt([
    {
      type: 'list',
      message: 'which department name would you like to change?',
      choices: departmentsArr,
      name: 'oldName'
    },
    {
      type: 'input',
      message: 'What do you want to change this department name to?',
      name: 'newName'
    }
  ])

  const r = await db.query(`update departments set department = \'${edit.newName}\' where department = \'${edit.oldName}\'`);
  if (r.warningCount === 0) console.log('Successfully changed name');
  else console.log('Something went wrong, please consult your database administrator');
}

async function editRoles() {
  console.log('TO-DO: Edit roles');
}

async function editEmployees() {
  console.log('TO-DO: Edit employees');
}

async function removeDepartment() {
  console.log('TO-DO: Remove department');
}

async function removeRole() {
  console.log('TO-DO: Remove role');
}

async function removeEmployee() {
  console.log('TO-DO: Remove employee');
}

async function addDepartment() {
  const res = await inquirer.prompt([
    {
      type: 'input',
      message: 'Please enter the name of the new department:',
      name: 'newDept'
    }
  ])
  const r = await db.query(`INSERT INTO departments (department) VALUES (\'${res.newDept}\');`);
  if (r.warningCount === 0) console.log('Successfully changed name');
  else console.log('Something went wrong, please consult your database administrator');
}

async function addRole() {
  console.log('TO-DO: Add role');
}

async function addEmployee() {
  console.log('TO-DO: Add employee');
}