
export interface Student {
  id: string;
  name: string;
  group: string;
  isPresent: boolean;
}

export interface Lecture {
  id: string;
  title: string;
  date: string;
  time: string;
  students: Student[];
  showTotal?: boolean;
}
