USE company_db;

INSERT INTO departments (department) VALUES ('Engineering');
INSERT INTO departments (department) VALUES ('Project Management');
INSERT INTO departments (department) VALUES ('Human Resources');

INSERT INTO roles (title, salary, department_id) VALUES ("Eng Manager",300000,1);
INSERT INTO roles (title, salary, department_id) VALUES ("Eng Employee",60000,1);
INSERT INTO roles (title, salary, department_id) VALUES ("PM Manager",250000,2);
INSERT INTO roles (title, salary, department_id) VALUES ("PM Employee",50000,2);
INSERT INTO roles (title, salary, department_id) VALUES ("HR Manager",180000,3);
INSERT INTO roles (title, salary, department_id) VALUES ("PM Employee",40000,3);

INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("Adam", "Mana", 1, null);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("Claire", "Tree", 3, null);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("Herman", "Drough", 5, null);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("Eve", "Young", 2, 1);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("Alex", "Beroit", 4, 2);
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("Hersh", "Lee", 6, 3);