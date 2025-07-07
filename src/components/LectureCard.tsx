
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Clock } from "lucide-react";
import { Lecture } from "@/types/lecture";

interface LectureCardProps {
  lecture: Lecture;
  onSelect: (lecture: Lecture) => void;
}

const LectureCard = ({ lecture, onSelect }: LectureCardProps) => {
  const presentCount = lecture.students.filter(student => student.isPresent).length;
  const totalCount = lecture.students.length;

  const getAttendanceDisplay = () => {
    if (lecture.showTotal) {
      return `${presentCount}/${totalCount}`;
    }
    return presentCount.toString();
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary"
      onClick={() => onSelect(lecture)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {lecture.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{lecture.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{lecture.time}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{getAttendanceDisplay()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureCard;
