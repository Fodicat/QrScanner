import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Trash2,
  Plus,
  QrCode,
  X,
} from "lucide-react";
import { Lecture } from "@/types/lecture";
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from "html5-qrcode";

interface AttendanceViewProps {
  lecture: Lecture;
  onBack: () => void;
  onRemoveStudent: (lectureId: string, studentId: string) => void;
  onStudentAdded?: () => void;
  onLectureUpdated?: (updatedLecture: Lecture) => void;
}

const AttendanceView = ({
  lecture,
  onBack,
  onStudentAdded,
  onLectureUpdated,
}: AttendanceViewProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", group: "" });
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const presentStudents = lecture?.students?.filter((s) => s.isPresent) || [];
  const presentCount = presentStudents.length;
  const totalCount = lecture?.students?.length || 0;

  const getAttendanceDisplay = () => {
    return lecture.showTotal
      ? `Присутствует: ${presentCount}/${totalCount}`
      : `Присутствует: ${presentCount}`;
  };

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-scanner";
  const [scanCooldown, setScanCooldown] = useState(false);
  const cooldownTime = 2000; // время блокировки в миллисекундах

  const lastScannedCodeRef = useRef<string | null>(null);
  const scanCooldownRef = useRef(false);

 const handleQrScan = async (data: string | null) => {
  if (!data) return;
  if (scanCooldownRef.current) return;
  if (data === lastScannedCodeRef.current) return;

  scanCooldownRef.current = true;
  lastScannedCodeRef.current = data;

  setScanCooldown(true); // ставим блокировку
  setLastScannedCode(data);

  try {
    const studentData = JSON.parse(data);
    if (studentData.name && studentData.studentId) {
      await fetch(`${import.meta.env.VITE_API_URL}/api/lectures/student/Add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: lecture.id,
          name: studentData.name.trim(),
          group: studentData.studentId.trim(),
          isPresent: true,
        }),
      });

      onStudentAdded?.();

      try {
        const updatedRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/lectures/${lecture.id}`
        );
        const updatedLecture = await updatedRes.json();
        onLectureUpdated?.(updatedLecture);
      } catch (err) {
        console.error("Ошибка обновления после сканирования:", err);
      }
    } else {
      alert("Некорректные данные в QR-коде");
    }
  } catch {
    alert("Не удалось прочитать данные из QR-кода");
  }

  // Снимаем блокировку через cooldownTime
  setTimeout(() => {
    scanCooldownRef.current = false;
  }, cooldownTime);
};

  useEffect(() => {
    if (showQrScanner) {
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices.length > 0) {
            const backCamera =
              devices.find((d) => /back|rear|environment/i.test(d.label)) || devices[0];

            const cameraId = backCamera.id;

            const config: Html5QrcodeCameraScanConfig = {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            };

            scanner
              .start(
                cameraId,
                config,
                (decodedText) => {
                  handleQrScan(decodedText);
                  // НЕ закрываем сканер здесь, оставляем активным
                },
                (error) => {
                  console.warn("QR error:", error);
                }
              )
              .catch((err) => {
                console.error("Ошибка запуска сканера:", err);
                alert("Не удалось запустить сканер.");
              });
          } else {
            alert("Нет доступных камер.");
          }
        })
        .catch((err) => {
          console.error("Ошибка доступа к камере:", err);
          alert("Ошибка доступа к камере.");
        });
    }

    return () => {
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch((e) => {
            console.warn("scanner.stop() вызван до запуска:", e.message);
          });
      }
      setLastScannedCode(null);
    };
  }, [showQrScanner]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent.name.trim() && newStudent.group.trim()) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/lectures/student/Add`, {
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

        setTimeout(async () => {
          const updatedRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/lectures/${lecture.id}`
          );
          const updatedLecture = await updatedRes.json();
          onLectureUpdated?.(updatedLecture);
        }, 1500);
      } catch (err) {
        console.error("Ошибка при добавлении студента:", err);
      }
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/lectures/student/Remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lectureId: lecture.id, studentId }),
      });

      setTimeout(async () => {
        const updatedRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/lectures/${lecture.id}`
        );
        const updatedLecture = await updatedRes.json();
        onLectureUpdated?.(updatedLecture);
      }, 1000);
    } catch (err) {
      console.error("Ошибка при удалении студента:", err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (lecture?.id) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/lectures/${lecture.id}`
          );
          const updated = await res.json();
          onLectureUpdated?.(updated);
        } catch (err) {
          console.error("Ошибка обновления лекции:", err);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lecture?.id, onLectureUpdated]);

  return (
    <div className="space-y-6 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lecture.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
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
          <CardTitle className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
            <span>Присутствующие студенты</span>
            <div className="flex flex-wrap gap-2">
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
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showQrScanner && (
            <div className="p-4 border rounded-lg bg-gray-50 relative max-w-md mx-auto">
              <div
                id={scannerId}
                style={{ width: "100%", height: "300px" }}
                className="mb-4"
              />
            </div>
          )}

          {showAddForm && (
            <form onSubmit={handleAddStudent} className="space-y-2 max-w-md mx-auto">
              <div>
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="group">Группа</Label>
                <Input
                  id="group"
                  value={newStudent.group}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, group: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="mt-2">
                Добавить
              </Button>
            </form>
          )}

          {presentStudents.length === 0 ? (
            <p>Нет присутствующих студентов</p>
          ) : (
            <ul className="space-y-2 max-w-md mx-auto">
              {presentStudents.map((student) => (
                <li
                  key={student.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.group}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveStudent(Number(student.id))}
                    className="ml-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceView;
