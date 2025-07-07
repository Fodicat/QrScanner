
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lecture } from "@/types/lecture";
import LectureCard from "@/components/LectureCard";
import CreateLectureModal from "@/components/CreateLectureModal";
import AttendanceView from "@/components/AttendanceView";
import Login from "@/pages/Login";
import { LogOut } from "lucide-react";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lectures, setLectures] = useState<Lecture[]>([
    {
      id: "1",
      title: "Введение в React",
      date: "2024-01-15",
      time: "10:00",
      showTotal: true,
      students: [
        { id: "1", name: "Иван Иванов", group: "ИТ-21", isPresent: true },
        { id: "2", name: "Мария Петрова", group: "ИТ-21", isPresent: false },
        { id: "3", name: "Алексей Сидоров", group: "ИТ-22", isPresent: true },
      ]
    },
    {
      id: "2",
      title: "Состояние и хуки",
      date: "2024-01-17",
      time: "10:00",
      showTotal: false,
      students: [
        { id: "1", name: "Иван Иванов", group: "ИТ-21", isPresent: false },
        { id: "2", name: "Мария Петрова", group: "ИТ-21", isPresent: true },
      ]
    }
  ]);

  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  const handleLogin = (lastName: string, password: string) => {
    // Простая проверка - в реальном проекте здесь будет проверка через базу данных
    if (lastName.trim() && password.trim()) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedLecture(null);
  };

  const handleCreateLecture = (newLecture: Omit<Lecture, 'id'>) => {
    const lecture: Lecture = {
      ...newLecture,
      id: Date.now().toString()
    };
    setLectures(prev => [lecture, ...prev]);
  };

  const handleRemoveStudent = (lectureId: string, studentId: string) => {
    setLectures(prev =>
      prev.map(lecture =>
        lecture.id === lectureId
          ? {
              ...lecture,
              students: lecture.students.filter(student => student.id !== studentId)
            }
          : lecture
      )
    );

    // Обновляем также выбранную лекцию для отображения
    if (selectedLecture && selectedLecture.id === lectureId) {
      setSelectedLecture(prev =>
        prev ? {
          ...prev,
          students: prev.students.filter(student => student.id !== studentId)
        } : null
      );
    }
  };

  const handleAddStudent = (lectureId: string, newStudent: { name: string; group: string; isPresent: boolean }) => {
    const student = {
      ...newStudent,
      id: Date.now().toString()
    };

    setLectures(prev =>
      prev.map(lecture =>
        lecture.id === lectureId
          ? {
              ...lecture,
              students: [...lecture.students, student]
            }
          : lecture
      )
    );

    // Обновляем также выбранную лекцию для отображения
    if (selectedLecture && selectedLecture.id === lectureId) {
      setSelectedLecture(prev =>
        prev ? {
          ...prev,
          students: [...prev.students, student]
        } : null
      );
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (selectedLecture) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          </div>
          <AttendanceView
            lecture={selectedLecture}
            onBack={() => setSelectedLecture(null)}
            onRemoveStudent={handleRemoveStudent}
            onAddStudent={handleAddStudent}
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Управление лекциями
            </h1>
            <p className="text-gray-600">
              Создавайте лекции и отмечайте присутствие студентов
            </p>
          </div>
          <div className="flex items-center gap-4">
            <CreateLectureModal onCreateLecture={handleCreateLecture} />
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </Button>
          </div>
        </div>

        {lectures.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Нет созданных лекций
              </h3>
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
