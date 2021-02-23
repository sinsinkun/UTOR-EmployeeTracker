USE employee_db;

INSERT INTO department (name) VALUES ('Engineering');
INSERT INTO department (name) VALUES ('Project Management');
INSERT INTO department (name) VALUES ('Human Resources');

INSERT INTO role (title, salary, department_id) VALUES ("EG Manager",300000,1);
INSERT INTO role (title, salary, department_id) VALUES ("EG Employee",60000,1);
INSERT INTO role (title, salary, department_id) VALUES ("PM Manager",250000,2);
INSERT INTO role (title, salary, department_id) VALUES ("PM Employee",50000,2);
INSERT INTO role (title, salary, department_id) VALUES ("HR Manager",180000,3);
INSERT INTO role (title, salary, department_id) VALUES ("PM Employee",40000,3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Egman", "Ager", 1, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Pmman", "Ager", 3, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Hrman", "Ager", 5, null);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Egem", "Ployee", 2, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Pmemp", "Loyee", 4, 2);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Hremplo", "Yee", 6, 3);