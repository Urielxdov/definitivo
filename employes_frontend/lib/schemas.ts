import { z } from 'zod';
import { toRFC3339 } from './dates';

const dateField = z
  .string()
  .refine(d => !isNaN(Date.parse(d)), 'Invalid date')
  .transform(toRFC3339);

export const employeeSchema = z.object({
  employee_id: z.string().default(''),
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  middle_names: z.string().default(''),
  gender: z.enum(['D', 'M', 'F'], { message: 'Must be D, M or F' }),
  date_of_birth: dateField,
  date_of_hiring: dateField,
  date_of_termination: z.string().optional().default('').transform(d => d ? toRFC3339(d) : '2222-01-01T00:00:00Z'),
  date_of_probation_end: z.string().optional().default('').transform(d => d ? toRFC3339(d) : '1920-07-01T00:00:00Z'),
});

export const departmentSchema = z.object({
  dept_no: z.string().min(1, 'Required'),
  dept_name: z.string().min(1, 'Required'),
});

export const salarySchema = z.object({
  emp_no: z.string().transform(Number),
  salary: z.string().transform(Number),
  from_date: dateField,
  to_date: dateField,
});

export const titleSchema = z.object({
  emp_no: z.string().transform(Number),
  title: z.string().min(1, 'Required'),
  from_date: dateField,
  to_date: dateField,
});

export const deptEmpSchema = z.object({
  emp_no: z.string().transform(Number),
  dept_no: z.string().min(1, 'Required'),
  from_date: dateField,
  to_date: dateField,
});

export const deptManagerSchema = z.object({
  emp_no: z.string().transform(Number),
  dept_no: z.string().min(1, 'Required'),
  from_date: dateField,
  to_date: dateField,
});

export const salaryGroupSchema = z.object({
  sg_name: z.string().min(1, 'Required'),
  base_salary: z.string().transform(Number),
  from_date: dateField,
  to_date: dateField,
});

export const sgEmpSchema = z.object({
  emp_no: z.string().transform(Number),
  sg_no: z.string().transform(Number),
  from_date: dateField,
  to_date: dateField,
});

export const countrySchema = z.object({
  iso: z.string().min(1, 'Required').max(2, 'Max 2 chars'),
  name: z.string().min(1, 'Required'),
  nicename: z.string().min(1, 'Required'),
  iso3: z.string().max(3).optional().default(''),
  numcode: z.string().optional().default('').transform(v => v ? Number(v) : null),
  phonecode: z.string().transform(Number),
});

export const regionSchema = z.object({
  name: z.string().min(1, 'Required'),
  nicename: z.string().min(1, 'Required'),
  note: z.string().default(''),
  country: z.string().transform(Number),
});

export const regionEmpSchema = z.object({
  emp_no: z.string().transform(Number),
  region_id: z.string().transform(Number),
  from_date: dateField,
  to_date: dateField,
});

export const schemas: Record<string, z.ZodObject<any>> = {
  employees: employeeSchema,
  departments: departmentSchema,
  salaries: salarySchema,
  titles: titleSchema,
  dept_emp: deptEmpSchema,
  dept_manager: deptManagerSchema,
  salary_groups: salaryGroupSchema,
  sg_emp: sgEmpSchema,
  countries: countrySchema,
  regions: regionSchema,
  region_emp: regionEmpSchema,
};
