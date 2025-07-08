import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, Clock, Users, Trash2, Plus, QrCode, X } from "lucide-react";
import { Lecture, Student } from "@/types/lecture";
import { Html5QrcodeScanner } from "html5-qrcode";


interface AttendanceViewProps {
  lecture: Lecture;
  onBack: () => void;
  onRemoveStudent: (lectureId: string, studentId: string) => void;
  onStudentAdded?: () => void;
  onLectureUpdated?: (updatedLecture: Lecture) => void; // <== добавлено
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
};

const AttendanceView = ({
  lecture,
  onBack,
  onRemoveStudent,
  onStudentAdded,
  onLectureUpdated,
}: AttendanceViewProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", group: "" });

  const presentStudents = lecture?.students?.filter((student) => student.isPresent) || [];
  const presentCount = presentStudents.length;
  const totalCount = lecture?.students?.length || 0;

  const getAttendanceDisplay = () => {
    if (lecture.showTotal) {
      return `Присутствует: ${presentCount}/${totalCount}`;
    }
    return `Присутствует: ${presentCount}`;
  };

  const handleQrScan = (data: string | null) => {
    if (data) {
      try {
        // Предполагаем, что QR-код содержит JSON с данными студента
        const studentData = JSON.parse(data);
        if (studentData.name && studentData.group) {
          setNewStudent({
            name: studentData.name,
            group: studentData.group
          });
          setShowQrScanner(false);
          setShowAddForm(true);
        }
      } catch (error) {
        // Если QR-код не содержит JSON, просто показываем его содержимое в поле имени
        setNewStudent({
          name: data,
          group: ""
        });
        setShowQrScanner(false);
        setShowAddForm(true);
      }
    }
  };

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
  if (showQrScanner) {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };

    const scanner = new Html5QrcodeScanner("qr-scanner", config, false);

    scanner.render(
      (text: string) => {
        handleQrScan(text);
        setShowQrScanner(false);
        scanner.clear(); // Останавливаем сканирование
      },
      (err) => {
        console.warn("QR error:", err);
      }
    );

    scannerRef.current = scanner;
  }

  return () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
    }
  };
}, [showQrScanner]);

  const handleQrError = (error: any) => {
    console.error('QR Scanner Error:', error);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
  e.preventDefault();
  if (newStudent.name.trim() && newStudent.group.trim()) {
    try {
      const response = await fetch("http://localhost:3000/api/lectures/student/Add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: lecture.id,
          name: newStudent.name.trim(),
          group: newStudent.group.trim(),
          isPresent: true,
        }),
      });

      setNewStudent({ name: "", group: "" });
      setShowAddForm(false);
      onStudentAdded?.();

      // ⏳ Подождать 1.5 секунды перед обновлением
      setTimeout(async () => {
        const updatedRes = await fetch(`http://localhost:3000/api/lectures/${lecture.id}`);
        const updatedLecture = await updatedRes.json();
        onLectureUpdated?.(updatedLecture);
      }, 1500);

    } catch (err) {
      console.error("Ошибка при добавлении студента:", err);
    }
  }
};


  useEffect(() => {
  let interval: NodeJS.Timeout | null = null;

  if (lecture?.id) {
    interval = setInterval(async () => {
      try {
        console.log("Обновляем лекцию с id:", lecture.id);
        const res = await fetch(`http://localhost:3000/api/lectures/${lecture.id}`);
        const updated = await res.json();
        onLectureUpdated?.(updated);
      } catch (err) {
        console.error("Ошибка при обновлении данных лекции:", err);
      }
    }, 5000);
  } else {
    console.warn("Нет lecture.id, обновление лекции не запускается");
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [lecture?.id, onLectureUpdated]);


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
              <span>{lecture.date}</span>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQrScanner(true)}
                  className="flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  QR
                </Button>
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
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showQrScanner && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Сканирование QR-кода</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowQrScanner(false);
                    if (scannerRef.current) {
                      scannerRef.current.clear();
                    }
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-4">
                  Наведите камеру на QR-код студента
                </p>
                <div className="rounded-lg overflow-hidden" id="qr-scanner" />
                <p className="text-xs text-gray-500 mt-2">
                  QR-код должен содержать имя и группу студента
                </p>
              </div>
            </div>
          )}


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
