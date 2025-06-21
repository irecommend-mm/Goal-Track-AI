export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  type: 'weekly' | 'monthly';
}
