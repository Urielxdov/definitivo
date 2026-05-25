export interface Employee {
  emp_no: number;
  employee_id: string;
  date_of_birth: string;
  first_name: string;
  last_name: string;
  middle_names: string;
  gender: string;
  date_of_hiring: string;
  date_of_termination: string;
  date_of_probation_end: string;
}

export interface Department {
  dept_no: string;
  dept_name: string;
}

export interface Salary {
  emp_no: number;
  salary: number;
  from_date: string;
  to_date: string;
}

export interface Title {
  emp_no: number;
  title: string;
  from_date: string;
  to_date: string;
}

export interface DeptEmp {
  emp_no: number;
  dept_no: string;
  from_date: string;
  to_date: string;
}

export interface DeptManager {
  emp_no: number;
  dept_no: string;
  from_date: string;
  to_date: string;
}

export interface SalaryGroup {
  sg_no: number;
  sg_name: string;
  base_salary: number;
  from_date: string;
  to_date: string;
}

export interface SgEmp {
  emp_no: number;
  sg_no: number;
  from_date: string;
  to_date: string;
}

export interface Country {
  id: number;
  iso: string;
  name: string;
  nicename: string;
  iso3: string | null;
  numcode: number | null;
  phonecode: number;
}

export interface Region {
  id: number;
  name: string;
  nicename: string;
  note: string;
  country: number;
}

export interface RegionEmp {
  emp_no: number;
  region_id: number;
  from_date: string;
  to_date: string;
}

export type EntityType =
  | 'employees'
  | 'departments'
  | 'salaries'
  | 'titles'
  | 'dept_emp'
  | 'dept_manager'
  | 'salary_groups'
  | 'sg_emp'
  | 'countries'
  | 'regions'
  | 'region_emp';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
