INSERT INTO department (department_name)
VALUES ("marketing"),
       ("Finance"),
       ("Software"),
       ("Human Resources");

INSERT INTO role (title, salary, department_id)
VALUES ("Director of Marketing", 60000, 1),
       ("Marketing Analyst", 55000, 1),
       ("Marketing Specialist", 40000, 1),
       ("Budgeting and Forecasting", 55000, 2),
       ("Bookkeeping", 60000, 2 ),
       ("Project Manager", 80000, 3),
       ("UX/UI Designers", 650000, 3),
       ("Software Developers", 60000, 3),
       ("HR manager", 55000, 4),
       ("Payroll Manager", 50000, 4),
       ("HR Executive", 450000, 4);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("John", "Doe", 2),
        ("Ben", "sky", 5,1),
        ("Tom", "Wright", 7,1),
        ("Chris", "Walsh", 1,1),
        ("Steve", "Bash", 4,1),
        ("Jen", "Green", 9,1),
        ("Gale", "Briggs",11,1),
        ("Kevin", "Greg", 3,1),
        ("Heather", "McGee", 6,1),
        ("Peter", "Simmons", 8,1),
        ("Joseph", "White", 10,1);
