package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

var empCols = []string{
	"emp_no", "employee_id", "date_of_birth", "first_name", "last_name",
	"middle_names", "gender", "date_of_hiring", "date_of_termination", "date_of_probation_end",
}

var testTime = time.Date(1990, 1, 15, 0, 0, 0, 0, time.UTC)

func newMockEmployeeHandler(t *testing.T) (*EmployeeHandler, sqlmock.Sqlmock, func()) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("sqlmock.New: %v", err)
	}
	return NewEmployeeHandler(db), mock, func() { db.Close() }
}

func TestEmployeeList(t *testing.T) {
	h, mock, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	rows := sqlmock.NewRows(empCols).AddRow(
		1, "EMP001", testTime, "John", "Doe", "", "M", testTime, testTime, testTime,
	)
	mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT emp_no, employee_id, date_of_birth, first_name, last_name, middle_names, gender, date_of_hiring, date_of_termination, date_of_probation_end FROM employee LIMIT 100",
	)).WillReturnRows(rows)

	req := httptest.NewRequest("GET", "/api/v1/employees", nil)
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var resp APIResponse
	json.NewDecoder(w.Body).Decode(&resp)
	if !resp.Success {
		t.Error("expected success=true")
	}
}

func TestEmployeeGet(t *testing.T) {
	h, mock, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	row := sqlmock.NewRows(empCols).AddRow(
		10001, "EMP10001", testTime, "John", "Doe", "", "M", testTime, testTime, testTime,
	)
	mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT emp_no, employee_id, date_of_birth, first_name, last_name, middle_names, gender, date_of_hiring, date_of_termination, date_of_probation_end FROM employee WHERE emp_no = ?",
	)).WithArgs(10001).WillReturnRows(row)

	req := httptest.NewRequest("GET", "/api/v1/employees/10001", nil)
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestEmployeeGet_InvalidID(t *testing.T) {
	h, _, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	req := httptest.NewRequest("GET", "/api/v1/employees/abc", nil)
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestEmployeeGet_NotFound(t *testing.T) {
	h, mock, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT emp_no, employee_id, date_of_birth, first_name, last_name, middle_names, gender, date_of_hiring, date_of_termination, date_of_probation_end FROM employee WHERE emp_no = ?",
	)).WithArgs(99999).WillReturnRows(sqlmock.NewRows(empCols))

	req := httptest.NewRequest("GET", "/api/v1/employees/99999", nil)
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d", w.Code)
	}
}

func TestEmployeeCreate(t *testing.T) {
	h, mock, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	mock.ExpectExec(regexp.QuoteMeta(
		"INSERT INTO employee (employee_id, date_of_birth, first_name, last_name, middle_names, gender, date_of_hiring, date_of_termination, date_of_probation_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
	)).WillReturnResult(sqlmock.NewResult(42, 1))

	body, _ := json.Marshal(Employee{
		EmployeeID:         "EMP999",
		FirstName:          "Jane",
		LastName:           "Doe",
		Gender:             "F",
		DateOfBirth:        testTime,
		DateOfHiring:       testTime,
		DateOfTermination:  testTime,
		DateOfProbationEnd: testTime,
	})

	req := httptest.NewRequest("POST", "/api/v1/employees", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("expected 201, got %d", w.Code)
	}
}

func TestEmployeeCreate_BadJSON(t *testing.T) {
	h, _, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	req := httptest.NewRequest("POST", "/api/v1/employees", bytes.NewBufferString("not json"))
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestEmployeeUpdate(t *testing.T) {
	h, mock, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	mock.ExpectExec(regexp.QuoteMeta(
		"UPDATE employee SET employee_id = ?, date_of_birth = ?, first_name = ?, last_name = ?, middle_names = ?, gender = ?, date_of_hiring = ?, date_of_termination = ?, date_of_probation_end = ? WHERE emp_no = ?",
	)).WillReturnResult(sqlmock.NewResult(0, 1))

	body, _ := json.Marshal(Employee{
		EmployeeID:         "EMP999",
		FirstName:          "Jane",
		LastName:           "Doe",
		Gender:             "F",
		DateOfBirth:        testTime,
		DateOfHiring:       testTime,
		DateOfTermination:  testTime,
		DateOfProbationEnd: testTime,
	})

	req := httptest.NewRequest("PUT", "/api/v1/employees/10001", bytes.NewReader(body))
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestEmployeeUpdate_NoID(t *testing.T) {
	h, _, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	req := httptest.NewRequest("PUT", "/api/v1/employees", nil)
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestEmployeeDelete(t *testing.T) {
	h, mock, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	mock.ExpectExec(regexp.QuoteMeta(
		"DELETE FROM employee WHERE emp_no = ?",
	)).WithArgs(10001).WillReturnResult(sqlmock.NewResult(0, 1))

	req := httptest.NewRequest("DELETE", "/api/v1/employees/10001", nil)
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestEmployeeDelete_NotFound(t *testing.T) {
	h, mock, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	mock.ExpectExec(regexp.QuoteMeta(
		"DELETE FROM employee WHERE emp_no = ?",
	)).WithArgs(99999).WillReturnResult(sqlmock.NewResult(0, 0))

	req := httptest.NewRequest("DELETE", "/api/v1/employees/99999", nil)
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d", w.Code)
	}
}

func TestEmployeeMethodNotAllowed(t *testing.T) {
	h, _, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	req := httptest.NewRequest("PATCH", "/api/v1/employees", nil)
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("expected 405, got %d", w.Code)
	}
}

func TestEmployeeList_DBError(t *testing.T) {
	h, mock, cleanup := newMockEmployeeHandler(t)
	defer cleanup()

	mock.ExpectQuery(regexp.QuoteMeta(
		"SELECT emp_no, employee_id, date_of_birth, first_name, last_name, middle_names, gender, date_of_hiring, date_of_termination, date_of_probation_end FROM employee LIMIT 100",
	)).WillReturnError(sql.ErrConnDone)

	req := httptest.NewRequest("GET", "/api/v1/employees", nil)
	w := httptest.NewRecorder()
	h.Handle(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected 500, got %d", w.Code)
	}
}
