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
        choices: ['View existing data', 'Edit existing data', 'Add new data'],
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
    else if (task.choice === 'Edit existing data' && task.table === 'Departments') await editDepartments();
    else if (task.choice === 'Edit existing data' && task.table === 'Roles') await editRoles();
    else if (task.choice === 'Edit existing data' && task.table === 'Employees') await editEmployees();
    // if adding existing data
    else if (task.choice === 'Add new data' && task.table === 'Departments') await addDepartment();
    else if (task.choice === 'Add new data' && task.table === 'Roles') await addRole();
    else if (task.choice === 'Add new data' && task.table === 'Employees') await addEmployee();

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
  let deptList = await db.query(`select departments.department from departments`);
  deptList = deptList.map(arr => arr.department);

  const edit = await inquirer.prompt([
    {
      type: 'list',
      message: 'which department name would you like to change?',
      choices: deptList,
      name: 'oldName'
    },
    {
      type: 'input',
      message: 'What do you want to change this department name to?',
      name: 'newName'
    }
  ])

  const r = await db.query(`update departments set department = \'${edit.newName}\' 
    where department = \'${edit.oldName}\'`);
  if (r.warningCount === 0) console.log('Successfully changed department name\n');
  else console.log('Something went wrong, please consult your database administrator\n');
}

async function editRoles() {
  let roleList = await db.query(`select roles.id, roles.title, roles.salary, departments.department 
    from roles left join departments on roles.department_id = departments.id;`);
  let rolesStrList = roleList.map(role => `Title: ${role.title}, from ${role.department}`);
  let targetId = null;

  const res = await inquirer.prompt([
    {
      type: 'list',
      message: 'Select which role to edit:',
      choices: rolesStrList,
      name: 'targetRole'
    },
    {
      type: 'input',
      message: 'New role title: (leave blank for no change)',
      name: 'newTitle'
    },
    {
      type: 'number',
      message: 'New role salary: (leave blank for no change)',
      name: 'newSalary'
    }
  ])

  // find id of target role
  for (let i=0; i<rolesStrList.length; i++) {
    if (res.targetRole === rolesStrList[i]) {
      targetId = roleList[i].id;
      if (res.newTitle === '') res.newTitle = roleList[i].title;
      if (isNaN(res.newSalary)) {
        res.newSalary = roleList[i].salary;
      }
    }
  }
  
  // make sure salary is a number
  if (!Number(res.newSalary)) {
    console.log('Salary must be a numerical value.\n');
    return;
  }

  const r = await db.query(`update roles set title = \'${res.newTitle}\', salary = ${res.newSalary}
  where id = ${targetId}`);
  if (r.warningCount === 0) console.log('Successfully changed role\n');
  else console.log('Something went wrong, please consult your database administrator\n');
}

async function editEmployees() {
  let roleList = await db.query(`select roles.id, roles.title, departments.department 
    from roles left join departments on roles.department_id = departments.id;`);
  let rolesStrList = roleList.map(role => `Title: ${role.title}, from ${role.department}`);
  let roleId = null;

  let res = await inquirer.prompt([
    {
      type: 'input',
      message: 'Please enter the employee\'s first name:',
      name: 'firstName'
    },
    {
      type: 'input',
      message: 'Please enter the employee\'s last name:',
      name: 'lastName'
    },
    {
      type: 'list',
      message: 'Please select the employee\'s role:',
      choices: rolesStrList,
      name: 'role'
    }
  ])

  for (let i=0; i<rolesStrList.length; i++) {
    if (rolesStrList[i] === res.role) roleId = roleList[i].id;
  }

  let employee = await db.query(`select * from employees where first_name =\'${res.firstName}\' 
  and last_name=\'${res.lastName}\' and role_id=${roleId}`);

  if (employee.length < 1) {
    console.log ('No employee record was found. Please try again.\n');
    return;
  }
  console.log ('\nEmployee Found. Continuing to next step.\n');

  res = await inquirer.prompt([
    {
      type: 'input',
      message: 'Please enter the employee\'s new first name: (leave blank for no change)',
      name: 'firstName'
    },
    {
      type: 'input',
      message: 'Please enter the employee\'s new last name: (leave blank for no change)',
      name: 'lastName'
    },
    {
      type: 'list',
      message: 'Please choose the employee\'s new role:',
      choices: rolesStrList,
      name: 'newRole'
    },
    {
      type: 'input',
      message: 'Please enter the employee\'s new manager\'s first name: (leave blank for no manager)',
      name: 'mgrFirstName'
    },
    {
      type: 'input',
      message: 'Please enter the employee\'s new manager\'s last name: (leave blank for no manager)',
      name: 'mgrLastName'
    }
  ])
  // change name if not blank
  if (res.firstName !== '') employee[0].first_name = res.firstName;
  if (res.lastName !== '') employee[0].last_name = res.lastName;
  // find new role
  for (let i=0; i<rolesStrList.length; i++) {
    if (rolesStrList[i] === res.newRole) employee[0].role_id = roleList[i].id;
  }
  // find new manager
  if (res.newLastName !== '') {
    let r = await db.query(`select * from employees where first_name =\'${res.mgrFirstName}\' 
    and last_name=\'${res.mgrLastName}\'`);
    if (r.length < 1) {
      console.log('Manager could not be found. Continuing without changing manager.\n');
    }
    else employee[0].manager_id = r[0].id;
  }
  else employee[0].manager_id = null;
  // fill in new data
  let r = await db.query(`update employees set first_name = \'${employee[0].first_name}\', last_name = \'${employee[0].last_name}\', 
    role_id = ${employee[0].role_id}, manager_id = ${employee[0].manager_id} where id = ${employee[0].id}`);
  if (r.warningCount === 0) console.log('Successfully edited employee record\n');
  else console.log('Something went wrong, please consult your database administrator\n');
}

async function addDepartment() {
  const res = await inquirer.prompt([
    {
      type: 'input',
      message: 'Please enter the name of the new department:',
      name: 'newDept'
    }
  ])
  // check if dept already exists
  let r = await db.query(`SELECT * FROM departments WHERE department = \'${res.newDept}\'`);
  if (r.length > 0) {
    console.log('Department already exists. Only new departments can be added.\n');
    return;
  }
  r = await db.query(`INSERT INTO departments (department) VALUES (\'${res.newDept}\');`);
  if (r.warningCount === 0) console.log('Successfully added new department\n');
  else console.log('Something went wrong, please consult your database administrator\n');
}

async function addRole() {
  let deptList = await db.query(`select * from departments`);
  let deptNames = deptList.map(dept => dept.department);
  let deptId = null;
  
  const res = await inquirer.prompt([
    {
      type: 'input',
      message: 'Please enter the name of the new role:',
      name: 'title'
    },
    {
      type: 'number',
      message: 'Please enter the role\'s salary:',
      name: 'salary'
    },
    {
      type: 'list',
      message: 'Which department does this role belong to?',
      choices: deptNames,
      name: 'dept'
    }
  ])
  // get ID for department
  for (let i=0; i< deptList.length; i++) {
    if (res.dept === deptList[i].department) {
      deptId = deptList[i].id;
      break;
    }
  }
  // check if role already exists
  let r = await db.query('SELECT * FROM roles');
  for (let i=0; i<allRoles.length; i++) {
    if (res.title === allRoles[i].title && deptId === allRoles[i].departmentId) {
      console.log('This role already exists. Only new roles can be added.\n');
      return;
    }
  }
  r = await db.query(`INSERT INTO roles (title, salary, department_id) VALUES (\'${res.title}\', ${res.salary}, ${deptId});`);
  if (r.warningCount === 0) console.log('Successfully added new department\n');
  else console.log('Something went wrong, please consult your database administrator\n');
}

async function addEmployee() {
  let roleList = await db.query(`select roles.id,roles.title,departments.department 
    from roles left join departments on roles.department_id = departments.id;`);
  let rolesStrList = roleList.map(role => `Title: ${role.title}, from ${role.department}`);
  let roleId = null;
  let managerId = null;
  let res = await inquirer.prompt([
    {
      type: 'input',
      message: 'Please enter the employee\'s first name:',
      name: 'firstName'
    },
    {
      type: 'input',
      message: 'Please enter the employee\'s last name:',
      name: 'lastName'
    },
    {
      type: 'list',
      message: 'Please select the employee\'s role:',
      choices: rolesStrList,
      name: 'role'
    },
    {
      type: 'input',
      message: 'Please enter the employee\'s manager\'s first name: (leave blank if no manager)',
      name: 'managerFirstName'
    },
    {
      type: 'input',
      message: 'Please enter the employee\'s manager\'s last name: (leave blank if no manager)',
      name: 'managerLastName'
    }
  ]);
  // find roleId
  for (let i=0; i<rolesStrList.length; i++) {
    if (rolesStrList[i] === res.role) roleId = roleList[i].id;
  }
  if (roleId === null) {
    console.log('Role cound not be found.\n');
    return;
  }
  // find managerId
  if (res.managerLastName !== '') {
    const r = await db.query(`select * from employees where first_name = \'${res.managerFirstName}\' and last_name = \'${res.managerLastName}\'`);
    if (r.length < 1) {
      console.log('Manager not found. Please make sure the spelling is correct.\n');
      return;
    }
    managerId = r[0].id;
  }

  let r = await db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) 
    VALUES (\'${res.firstName}\', \'${res.lastName}\', ${roleId}, ${managerId});`);
  if (r.warningCount === 0) console.log('Successfully added new employee.\n');
  else console.log('Something went wrong, please consult your database administrator\n');
}