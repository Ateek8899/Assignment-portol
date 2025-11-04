import { useState, useEffect } from "react";
import {
  getTeacherAssignments,
  getSubmissionsByAssignment,
  updateSubmissionGrade,
  getStudentById,
} from "../../services/firebaseDb";
import { getCurrentTeacher } from "../../services/session";

const TeacherGrading = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const teacher = getCurrentTeacher();

  // Load teacher's assignments
  useEffect(() => {
    if (teacher && teacher.id) {
      loadAssignments();
    }
  }, [teacher]);

  // Load submissions when an assignment is selected
  useEffect(() => {
    if (selectedAssignment) {
      loadSubmissions(selectedAssignment);
    }
  }, [selectedAssignment]);

  // -----------------------------
  // 🔹 Load Assignments
  // -----------------------------
  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getTeacherAssignments(teacher.id);
      setAssignments(data);

      if (data.length > 0) {
        setSelectedAssignment(data[0].id);
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
      setMessage({ type: "error", text: "Failed to load assignments." });
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 🔹 Load Submissions
  // -----------------------------
  const loadSubmissions = async (assignmentId) => {
    try {
      setLoading(true);
      const subs = await getSubmissionsByAssignment(assignmentId);

      // Attach student data to each submission
      const detailedSubs = await Promise.all(
        subs.map(async (sub) => {
          try {
            const student = await getStudentById(sub.studentId);
            return {
              ...sub,
              studentName: student?.name || "Unknown Student",
              rollNo: student?.rollNo || "N/A",
            };
          } catch {
            return {
              ...sub,
              studentName: "Unknown Student",
              rollNo: "N/A",
            };
          }
        })
      );

      setSubmissions(detailedSubs);
    } catch (error) {
      console.error("Error loading submissions:", error);
      setMessage({ type: "error", text: "Failed to load submissions." });
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 🔹 Handle Grade and Feedback
  // -----------------------------
  const handleGradeChange = (id, grade) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, grade } : sub))
    );
  };

  const handleFeedbackChange = (id, feedback) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, feedback } : sub))
    );
  };

  // -----------------------------
  // 🔹 Save Grade to Firebase
  // -----------------------------
  const saveGrade = async (id, grade, feedback) => {
    if (!grade.trim()) {
      setMessage({ type: "error", text: "Please enter a grade." });
      return;
    }

    try {
      setSaving((prev) => ({ ...prev, [id]: true }));
      await updateSubmissionGrade(id, grade, feedback || "");
      setMessage({ type: "success", text: "Grade updated successfully!" });

      // Refresh after saving
      if (selectedAssignment) loadSubmissions(selectedAssignment);
    } catch (error) {
      console.error("Error saving grade:", error);
      setMessage({ type: "error", text: "Failed to update grade." });
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  // -----------------------------
  // 🔹 Format Date
  // -----------------------------
  const formatDate = (timestamp) => {
    try {
      if (timestamp?.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleString();
      }
      return "N/A";
    } catch {
      return "N/A";
    }
  };

  // -----------------------------
  // 🔹 UI Rendering
  // -----------------------------
  return (
    <div className="teacher-grading">
      <h2>📚 Grade Submissions</h2>

      <div className="assignment-select">
        <label>Select Assignment:</label>
        <select
          value={selectedAssignment}
          onChange={(e) => setSelectedAssignment(e.target.value)}
          disabled={loading || assignments.length === 0}
        >
          {assignments.length === 0 ? (
            <option value="">No assignments available</option>
          ) : (
            assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.classOrCourse})
              </option>
            ))
          )}
        </select>
      </div>

      {message.text && (
        <div
          className={`message ${
            message.type === "error" ? "error" : "success"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <p>Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <p>No submissions found for this assignment.</p>
      ) : (
        <div className="table-wrapper">
          <table className="grading-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Submitted</th>
                <th>File</th>
                <th>Grade</th>
                <th>Feedback</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.studentName}</td>
                  <td>{sub.rollNo}</td>
                  <td>{formatDate(sub.submittedAt)}</td>
                  <td>
                    {sub.fileUrl ? (
                      <a href={sub.fileUrl} target="_blank" rel="noreferrer">
                        View File
                      </a>
                    ) : (
                      "No file"
                    )}
                  </td>
                  <td>
                    <input
                      type="text"
                      value={sub.grade || ""}
                      onChange={(e) =>
                        handleGradeChange(sub.id, e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={sub.feedback || ""}
                      onChange={(e) =>
                        handleFeedbackChange(sub.id, e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        saveGrade(sub.id, sub.grade, sub.feedback)
                      }
                      disabled={saving[sub.id]}
                    >
                      {saving[sub.id] ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherGrading;
