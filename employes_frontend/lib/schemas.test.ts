import {
  employeeSchema,
  departmentSchema,
  salarySchema,
  countrySchema,
  regionSchema,
} from './schemas';

const validEmployee = {
  employee_id: 'EMP001',
  first_name: 'John',
  last_name: 'Doe',
  middle_names: '',
  gender: 'M' as const,
  date_of_birth: '1990-01-15',
  date_of_hiring: '2020-03-01',
  date_of_termination: '',
  date_of_probation_end: '',
};

describe('employeeSchema', () => {
  it('parses valid employee and transforms dates to RFC3339', () => {
    const result = employeeSchema.parse(validEmployee);
    expect(result.first_name).toBe('John');
    expect(result.date_of_birth).toBe('1990-01-15T00:00:00Z');
    expect(result.date_of_hiring).toBe('2020-03-01T00:00:00Z');
  });

  it('rejects empty first_name', () => {
    expect(() => employeeSchema.parse({ ...validEmployee, first_name: '' })).toThrow();
  });

  it('rejects empty last_name', () => {
    expect(() => employeeSchema.parse({ ...validEmployee, last_name: '' })).toThrow();
  });

  it('rejects invalid gender value', () => {
    expect(() => employeeSchema.parse({ ...validEmployee, gender: 'X' })).toThrow();
  });

  it('accepts valid gender values D, M, F', () => {
    expect(() => employeeSchema.parse({ ...validEmployee, gender: 'D' })).not.toThrow();
    expect(() => employeeSchema.parse({ ...validEmployee, gender: 'F' })).not.toThrow();
  });
});

describe('departmentSchema', () => {
  it('parses valid department', () => {
    const result = departmentSchema.parse({ dept_no: 'd001', dept_name: 'Engineering' });
    expect(result.dept_no).toBe('d001');
    expect(result.dept_name).toBe('Engineering');
  });

  it('rejects empty dept_no', () => {
    expect(() => departmentSchema.parse({ dept_no: '', dept_name: 'Engineering' })).toThrow();
  });

  it('rejects empty dept_name', () => {
    expect(() => departmentSchema.parse({ dept_no: 'd001', dept_name: '' })).toThrow();
  });
});

describe('salarySchema', () => {
  it('transforms string emp_no and salary to numbers', () => {
    const result = salarySchema.parse({
      emp_no: '10001',
      salary: '75000',
      from_date: '2020-01-01',
      to_date: '2021-01-01',
    });
    expect(result.emp_no).toBe(10001);
    expect(result.salary).toBe(75000);
  });
});

describe('countrySchema', () => {
  const validCountry = {
    iso: 'US',
    name: 'United States',
    nicename: 'United States of America',
    phonecode: '1',
  };

  it('parses valid country and transforms phonecode to number', () => {
    const result = countrySchema.parse(validCountry);
    expect(result.iso).toBe('US');
    expect(result.phonecode).toBe(1);
  });

  it('rejects iso longer than 2 characters', () => {
    expect(() => countrySchema.parse({ ...validCountry, iso: 'USA' })).toThrow();
  });

  it('rejects empty iso', () => {
    expect(() => countrySchema.parse({ ...validCountry, iso: '' })).toThrow();
  });
});

describe('regionSchema', () => {
  it('transforms country string to number', () => {
    const result = regionSchema.parse({
      name: 'North',
      nicename: 'Northern Region',
      note: '',
      country: '5',
    });
    expect(result.country).toBe(5);
  });

  it('rejects empty name', () => {
    expect(() => regionSchema.parse({ name: '', nicename: 'Northern', note: '', country: '1' })).toThrow();
  });
});
