import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lecture } from "@/types/lecture";
import LectureCard from "@/components/LectureCard";
import CreateLectureModal from "@/components/CreateLectureModal";
import AttendanceView from "@/components/AttendanceView";
import Login from "@/pages/Login";
import { LogOut } from "lucide-react";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  // Восстановление пользователя из localStorage при монтировании
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  // Вынесенная функция загрузки лекций
  const fetchLectures = () => {
    if (!isLoggedIn) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/lectures`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Lectures from server:", data);

        data.forEach((lecture: Lecture, index: number) => {
          console.log(`Lecture ${index} id=${lecture.id} students type:`, typeof lecture.students);
          console.log(`Lecture ${index} students:`, lecture.students);
        });

        setLectures(data);
      })
      .catch((err) => console.error("Ошибка при загрузке лекций:", err));
  };

  const refreshLecture = async (lectureId: string) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lectures/${lectureId}`);
    const updatedLecture: Lecture = await res.json();
    setLectures((prev) =>
      prev.map((lec) => (lec.id === updatedLecture.id ? updatedLecture : lec))
    );
    setSelectedLecture(updatedLecture);
  } catch (err) {
    console.error("Ошибка при обновлении лекции:", err);
  }
};


  useEffect(() => {
    fetchLectures();
  }, [isLoggedIn]);

  const handleLogin = (lastName: string, password: string) => {
    if (lastName.trim() && password.trim()) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedLecture(null);
    localStorage.removeItem("user");
  };

  const handleCreateLecture = async (newLecture: Omit<Lecture, "id">) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lectures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLecture),
      });

      if (!res.ok) {
        throw new Error("Ошибка создания лекции");
      }

      setTimeout(() => {
        fetchLectures();
      }, 300);

    } catch (err) {
      console.error("Ошибка при создании лекции:", err);
    }
  };

  const handleRemoveStudent = (lectureId: string, studentId: string) => {
    setLectures((prev) =>
      prev.map((lecture) =>
        lecture.id === lectureId
          ? {
              ...lecture,
              students: Array.isArray(lecture.students)
                ? lecture.students.filter((s) => s.id !== studentId)
                : [],
            }
          : lecture
      )
    );

    if (selectedLecture?.id === lectureId) {
      setSelectedLecture((prev) =>
        prev
          ? {
              ...prev,
              students: Array.isArray(prev.students)
                ? prev.students.filter((s) => s.id !== studentId)
                : [],
            }
          : null
      );
    }
  };

  const handleAddStudent = (
    lectureId: string,
    newStudent: { name: string; group: string; isPresent: boolean }
  ) => {
    const student = {
      ...newStudent,
      id: Date.now().toString(),
    };

    setLectures((prev) =>
      prev.map((lecture) =>
        lecture.id === lectureId
          ? {
              ...lecture,
              students: Array.isArray(lecture.students)
                ? [...lecture.students, student]
                : [student],
            }
          : lecture
      )
    );

    if (selectedLecture?.id === lectureId) {
      setSelectedLecture((prev) =>
        prev
          ? {
              ...prev,
              students: Array.isArray(prev.students)
                ? [...prev.students, student]
                : [student],
            }
          : null
      );
    }
  };

  // Удалить студента из лекции
  const removeStudentFromLecture = async (
    lectureId: number,
    studentId: number
  ) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lectures/student/Remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lectureId, studentId }),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Ошибка при удалении студента:", err);
      throw err;
    }
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  if (selectedLecture) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          </div>
          <AttendanceView
            lecture={selectedLecture}
            onBack={() => setSelectedLecture(null)}
            onRemoveStudent={handleRemoveStudent}
            onLectureUpdated={(updated) => {
              setLectures((prev) =>
                prev.map((l) => (l.id === updated.id ? updated : l))
              );
              setSelectedLecture(updated);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Управление лекциями</h1>
            <p className="text-gray-600">Создавайте лекции и отмечайте присутствие студентов</p>
          </div>
          <div className="flex items-center gap-4">
            <CreateLectureModal onCreateLecture={handleCreateLecture} />
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          </div>
        </div>

        {lectures.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет созданных лекций</h3>
              <p className="text-gray-600 mb-6">
                Создайте свою первую лекцию, чтобы начать отмечать присутствие студентов
              </p>
              <CreateLectureModal onCreateLecture={handleCreateLecture} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures.map((lecture) => (
              <LectureCard
                key={lecture.id}
                lecture={lecture}
                onSelect={setSelectedLecture}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
