import React, { useContext, useEffect, useState } from "react";
import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";
import axios from "axios";

export default function StudentsEnrolled() {
  const [enrolledStudentsData, setEnrolledStudentsData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("total"); // "total", "name", "courses"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc", "desc"
  const [expandedStudent, setExpandedStudent] = useState(null);
  const { backUrl, getToken, currency } = useContext(AppContext);

  const fetchEnrolledStudentsData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backUrl + "api/educator/enrolled-students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        console.log('Received student data:', data.enrolledStudents);
        setEnrolledStudentsData(data.enrolledStudents);
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
    }
  };

  useEffect(() => {
    fetchEnrolledStudentsData();
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortedAndFilteredData = () => {
    if (!enrolledStudentsData) return [];

    let filteredData = enrolledStudentsData;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        student => 
          student.student?.name?.toLowerCase().includes(term) ||
          student.student?.email?.toLowerCase().includes(term) ||
          student.enrollments?.some(e => e.courseTitle?.toLowerCase().includes(term))
      );
    }

    // Apply sorting
    return filteredData.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case "name":
          compareA = a.student?.name?.toLowerCase() || '';
          compareB = b.student?.name?.toLowerCase() || '';
          break;
        case "courses":
          compareA = a.enrollments?.length || 0;
          compareB = b.enrollments?.length || 0;
          break;
        default: // total amount
          compareA = a.totalAmount || 0;
          compareB = b.totalAmount || 0;
      }

      if (sortOrder === "asc") {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
  };

  const sortedAndFilteredData = getSortedAndFilteredData();

  return enrolledStudentsData ? (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-medium mb-4 md:mb-0">All Enrolled Students</h2>
          <input
            type="text"
            placeholder="Search by name, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col items-center max-w-6xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-900 border-b border-gray-500/20 text-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center">#</th>
                  <th 
                    className="px-4 py-3 font-semibold text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("name")}
                  >
                    Student Info {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    className="px-4 py-3 font-semibold text-center cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("courses")}
                  >
                    Courses {sortBy === "courses" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    className="px-4 py-3 font-semibold text-center cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("total")}
                  >
                    Total Amount {sortBy === "total" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {sortedAndFilteredData.map((studentData, index) => (
                  <React.Fragment key={studentData.student?._id || index}>
                    <tr 
                      className={`border-b border-gray-500/20 hover:bg-gray-50 cursor-pointer ${
                        expandedStudent === studentData.student?._id ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => setExpandedStudent(
                        expandedStudent === studentData.student?._id ? null : studentData.student?._id
                      )}
                    >
                      <td className="px-4 py-3 text-center">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={studentData.student?.imageUrl || 'https://via.placeholder.com/32'} 
                            alt="profile" 
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium">{studentData.student?.name || 'Unknown Student'}</div>
                            <div className="text-gray-500 text-xs">{studentData.student?.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {studentData.enrollments?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {currency} {(studentData.totalAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                    {expandedStudent === studentData.student?._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="4" className="px-4 py-3">
                          <div className="ml-11">
                            <h4 className="font-medium mb-2">Enrolled Courses:</h4>
                            <div className="space-y-2">
                              {studentData.enrollments?.map((enrollment, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-600">{idx + 1}.</span>
                                    <span>{enrollment.courseTitle}</span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-gray-500">
                                      {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                                    </span>
                                    <span className="font-medium">
                                      {currency} {(enrollment.amount || 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {sortedAndFilteredData.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? "No results found" : "No students enrolled yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
}
