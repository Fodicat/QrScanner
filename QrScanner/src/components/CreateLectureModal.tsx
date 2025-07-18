
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { Lecture } from "@/types/lecture";

interface CreateLectureModalProps {
  onCreateLecture: (lecture: Omit<Lecture, 'id'>) => void;
}



const CreateLectureModal = ({ onCreateLecture }: CreateLectureModalProps) => {
  const [open, setOpen] = useState(false);
  const user = localStorage.getItem("user");
  const userObj = JSON.parse(user);
  const [formData, setFormData] = useState({
    teacherid: userObj.id,
    title: "",
    date: "",
    time: "",
    showTotal: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onCreateLecture({
      ...formData,
      students: []
    });
    
    setFormData({teacherid: userObj.id, title: "", date: "", time: "", showTotal: false });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Создать лекцию
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать новую лекцию</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название лекции</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите название лекции"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Время</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showTotal"
              checked={formData.showTotal}
              onCheckedChange={(checked) => setFormData({ ...formData, showTotal: checked as boolean })}
            />
            <Label htmlFor="showTotal" className="text-sm">
              Показывать общее количество студентов
            </Label>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLectureModal;
