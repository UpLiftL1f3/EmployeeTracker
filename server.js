const inquirer = require('inquirer');
const mysql = require('mysql2');
require('console.table');
require('dotenv').config();

// const PORT = process.env.PORT || 3306;
const password = process.env.password;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: password,
  database: 'employee_db',
});
connection.connect(function (err) {
  if (err) {
    throw err;
  }
  startingQuestions();
});

// connect to database

function startingQuestions() {
  inquirer
    .prompt({
      type: 'list',
      message: 'What would you like to do?',
      name: 'choosePath',
      choices: [
        'View All Departments',
        'View Roles',
        'View All Employees',
        'Add Roles',
        'Add employees',
        'Add department',
        'Update Employee Role',
      ],
    })
    .then(function (answer) {
      if (answer.choosePath === 'View All Departments') {
        ViewDepartments();
      } else if (answer.choosePath === 'View All Employees') {
        viewAllEmployees();
      } else if (answer.choosePath === 'View Roles') {
        viewAllRoles();
      } else if (answer.choosePath === 'Add department') {
        addNewDepartment();
      } else if (answer.choosePath === 'Add Roles') {
        addNewRole();
      } else if (answer.choosePath === 'Add employees') {
        addEmployee();
      } else if (answer.choosePath === 'Update Employee Role') {
        updateEmployeeRole();
      }
    });
}

function ViewDepartments() {
  connection.query('SELECT * FROM department', function (err, results) {
    if (err) {
      throw err;
    } else {
      return console.table(results);
    }
  });
}

function viewAllEmployees() {
  connection.query(
    'SELECT employee.id, employee.first_name, employee.last_name, role.title, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN employee manager ON manager.id = employee.manager_id LEFT JOIN role ON employee.role_id = role.id',
    function (err, results) {
      if (err) throw err;
      console.table(results); // results contains rows returned by server
      startingQuestions();
    }
  );
}

function viewAllRoles() {
  connection.query(
    'SELECT role.id, role.title, department.department_name, role.salary FROM role LEFT JOIN department ON department.id = role.department_id ',
    function (err, results) {
      if (err) throw err;
      console.table(results); // results contains rows returned by server
      startingQuestions();
    }
  );
}

function addNewDepartment() {
  inquirer
    .prompt({
      type: 'input',
      message: 'What is the name of the new department?',
      name: 'addNewDepartment',
    })
    .then((answer) => {
      connection.query(
        `INSERT INTO department (department_name) VALUES ('${answer.addNewDepartment}')`,
        function (err, results) {
          if (err) throw err;
          console.log(
            `successfully added ${answer.addNewDepartment} to departments`
          );
          startingQuestions();
        }
      );
    });
}

function addNewRole() {
  connection.query('SELECT * FROM department', function (err, results) {
    if (err) throw err;
    // console.log(results);
    let departmentChoices = results.map((result) => {
      return {
        name: result.department_name,
        value: result.id,
      };
    });
    console.log(departmentChoices);
    inquirer
      .prompt([
        {
          type: 'input',
          message: 'What is the title of the new role you would like to add?',
          name: 'addNewRoleTitle',
        },
        {
          type: 'input',
          message: 'What is the salary of the new role you would like to add?',
          name: 'addNewRoleSalary',
        },
        {
          type: 'list',
          message: 'Which department would you want to add the new role to?',
          name: 'addNewRoleDepartment',
          choices: departmentChoices,
        },
      ])
      .then((results) => {
        connection.query(
          `INSERT INTO role (title, salary, department_id) VALUES ('${results.addNewRoleTitle}', ${results.addNewRoleSalary}, ${results.addNewRoleDepartment} ) `
        );
        console.log(`added ${results.addNewRoleTitle} to the database`);
      });
  });
}

const addEmployee = () => {
  const empSql = `SELECT * FROM employee`;

  connection.query(empSql, (err, empRes) => {
    if (err) throw err;
    // obj for manager selection
    const managerSelect = [
      {
        name: 'None',
        value: 0,
      },
    ];
    // push all employee's into manager obj
    empRes.forEach(({ first_name, last_name, id }) => {
      managerSelect.push({
        name: first_name + ' ' + last_name,
        value: id,
      });
    });

    const roleSql = `SELECT * FROM role`;
    connection.query(roleSql, (err, roleRes) => {
      if (err) throw err;
      // all roles
      const availRoles = [];
      // push all roles into availRoles obj
      roleRes.forEach(({ title, id }) => {
        availRoles.push({
          name: title,
          value: id,
        });
      });

      inquirer
        .prompt([
          {
            type: 'input',
            message: "What is the employee's first name?",
            name: 'firstName',
            validate: (answer) => {
              if (answer.length < 1) {
                return console.log('Please enter a valid first name...\n');
              }
              return true;
            },
          },
          {
            type: 'input',
            message: "What is the employee's last name?",
            name: 'lastName',
            validate: (answer) => {
              if (answer.length < 1) {
                return console.log('Please enter a valid last name...\n');
              }
              return true;
            },
          },
          {
            type: 'list',
            message: "What is this employee's role?",
            name: 'role_id',
            choices: availRoles,
          },
          {
            type: 'list',
            message: "Who is this employee's manager?",
            name: 'manager_id',
            choices: managerSelect,
          },
        ])
        .then((answers) => {
          const sql = `INSERT INTO employee (
                  first_name,
                  last_name,
                  role_id,
                  manager_id) VALUES (?, ?, ?, ?)`;

          connection.query(
            sql,
            [
              answers.firstName,
              answers.lastName,
              answers.role_id,
              answers.manager_id,
            ],
            (err, res) => {
              if (err) throw err;
              console.log('Successfully added new employee!');

              startingQuestions();
            }
          );
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
};

const updateEmployeeRole = () => {
  const empSql = `SELECT first_name, last_name, id FROM employee`;

  connection.query(empSql, (err, empRes) => {
    if (err) throw err;
    // available employees
    const employees = [];
    // grab data, push it into employees
    empRes.forEach(({ first_name, last_name, id }) => {
      employees.push({
        name: first_name + ' ' + last_name,
        value: id,
      });
    });
    console.log(employees);

    const roleSql = `SELECT * FROM role`;

    connection.query(roleSql, (err, roleRes) => {
      if (err) throw err;
      // all roles
      const roles = [];
      // push all roles into roles
      roleRes.forEach(({ title, id }) => {
        roles.push({
          name: title,
          value: id,
        });
      });

      inquirer
        .prompt([
          {
            type: 'list',
            message: "Which employee's role would you like to change?",
            name: 'id',
            choices: employees,
          },
          {
            type: 'list',
            message: "What is this employee's new role?",
            name: 'role_id',
            choices: roles,
          },
        ])
        .then((answers) => {
          console.log('answers:', answers);
          const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

          connection.query(sql, [answers.role_id, answers.id], (err, res) => {
            if (err) throw err;
            console.log("Employee's role updated successfully.");

            startingQuestions();
          });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  });
};
