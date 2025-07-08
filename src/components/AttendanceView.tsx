import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Clock, Users, Trash2, Plus } from "lucide-react";
import { Lecture, Student } from "@/types/lecture";

interface AttendanceViewProps {
  lecture: Lecture;
  onBack: () => void;
  onRemoveStudent: (lectureId: string, studentId: string) => void;
  onAddStudent: (lectureId: string, student: Omit<Student, 'id'>) => void;
}

// Функция для форматирования даты: оставляем только YYYY-MM-DD
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
};

const AttendanceView = ({ lecture, onBack, onRemoveStudent, onAddStudent }: AttendanceViewProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    group: ""
  });

  const presentStudents = lecture.students.filter(student => student.isPresent);
  const presentCount = presentStudents.length;
  const totalCount = lecture.students.length;

  const getAttendanceDisplay = () => {
    if (lecture.showTotal) {
      return `Присутствует: ${presentCount}/${totalCount}`;
    }
    return `Присутствует: ${presentCount}`;
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent.name.trim() && newStudent.group.trim()) {
      onAddStudent(lecture.id, {
        name: newStudent.name.trim(),
        group: newStudent.group.trim(),
        isPresent: true
      });
      setNewStudent({ name: "", group: "" });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lecture.title}</h1>
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(lecture.date)}</span>  {/* Здесь применяем форматирование */}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{lecture.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{getAttendanceDisplay()}</span>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Присутствующие студенты</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-normal text-gray-600">
                {lecture.showTotal ? `${presentCount} из ${totalCount} студентов` : `${presentCount} студентов`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleAddStudent} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Имя студента</Label>
                  <Input
                    id="studentName"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="Введите имя и фамилию"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentGroup">Группа</Label>
                  <Input
                    id="studentGroup"
                    value={newStudent.group}
                    onChange={(e) => setNewStudent({ ...newStudent, group: e.target.value })}
                    placeholder="Введите группу"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button type="submit" size="sm">
                  Добавить студента
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStudent({ name: "", group: "" });
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}

          {presentStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Нет присутствующих студентов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {presentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">Группа: {student.group}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveStudent(lecture.id, student.id)}
                    className="ml-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceView;
