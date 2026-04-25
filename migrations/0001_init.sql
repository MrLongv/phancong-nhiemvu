DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','ns','gd','quanly')),
  department_id INTEGER,
  full_name TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  department_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  FOREIGN KEY(department_id) REFERENCES departments(id)
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  emp_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  position TEXT,
  department_id INTEGER,
  team_id INTEGER,
  manager_name TEXT,
  status TEXT DEFAULT 'dang_lam',
  note TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(department_id) REFERENCES departments(id),
  FOREIGN KEY(team_id) REFERENCES teams(id)
);

CREATE TABLE assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER UNIQUE NOT NULL,
  work_area TEXT,
  main_tasks TEXT,
  sub_tasks TEXT,
  daily_tasks TEXT,
  periodic_tasks TEXT,
  related_docs TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(employee_id) REFERENCES employees(id)
);

CREATE TABLE activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  detail TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments(name, code) VALUES
('HCQT','HCQT'),('Nhân sự','NS'),('Kế toán','KT'),('Kế hoạch','KH'),('Kỹ thuật công nghệ','KTCN'),('Kho NPL','KNPL'),('Kho TP','KTP'),('XN Cắt','XNCAT'),('XN1','XN1'),('XN2','XN2'),('Cơ điện','CODIEN');

INSERT INTO teams(department_id,name,code) VALUES
(1,'Bảo vệ','BV'),(1,'Tạp vụ','TV'),(1,'Nhà ăn','NA'),
(9,'Tổ 1','T1'),(9,'Tổ 3','T3'),(9,'Tổ 5','T5'),(9,'Tổ 7','T7'),(9,'Tổ 9','T9'),(9,'Tổ 11','T11'),(9,'Tổ 13','T13'),(9,'Tổ 15','T15'),(9,'Tổ 17','T17'),
(10,'Tổ 19','T19'),(10,'Tổ 21','T21'),(10,'Tổ 23','T23'),(10,'Tổ 25','T25'),(10,'Tổ 27','T27'),
(11,'Thợ điện','TD'),(11,'Thợ máy','TM');

INSERT INTO users(username,password,role,department_id,full_name) VALUES
('admin','123456','admin',NULL,'Quản trị hệ thống'),
('ns1','123456','ns',2,'Nhân sự 1'),
('ns2','123456','ns',2,'Nhân sự 2'),
('gd','123456','gd',NULL,'Giám đốc'),
('ql_hcqt','123456','quanly',1,'Quản lý HCQT'),
('ql_xn1','123456','quanly',9,'Quản lý XN1');

INSERT INTO employees(emp_code,full_name,position,department_id,team_id,manager_name,status,note) VALUES
('BV001','Nguyễn Văn A','Nhân viên bảo vệ',1,1,'Trưởng HCQT','dang_lam','Mẫu demo'),
('XN1001','Trần Thị B','Công nhân may',9,4,'Quản đốc XN1','dang_lam','Mẫu demo');

INSERT INTO assignments(employee_id,work_area,main_tasks,sub_tasks,daily_tasks,periodic_tasks,related_docs) VALUES
(1,'Cổng chính','Kiểm soát người và xe ra vào công ty\nGhi nhận khách đến liên hệ\nKiểm tra thẻ nhân viên, nhà thầu, khách','Hỗ trợ kiểm tra niêm phong xe hàng\nBáo cáo sự cố an ninh cho HCQT','Trực cổng theo ca\nGhi sổ khách\nTuần tra khu vực được phân công','Kiểm tra bình PCCC theo phân công\nTham gia diễn tập khi có yêu cầu','SOP bảo vệ, quy định ra vào cổng'),
(2,'Chuyền may tổ 1','May công đoạn được phân công theo mã hàng\nĐảm bảo năng suất và chất lượng','Hỗ trợ tổ trưởng khi đổi mã hàng','Nhận bán thành phẩm\nMay đúng kỹ thuật\nBáo lỗi cho tổ trưởng','Vệ sinh máy, khu vực làm việc','Quy trình sản xuất, hướng dẫn kỹ thuật');
