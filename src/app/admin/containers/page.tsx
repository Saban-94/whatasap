// הגדרת המבנה של משימה
interface ContainerTask {
  id: string;
  status?: string;
  client?: string;
  address?: string;
  action?: string;
}

// בתוך הקומפוננטה, כשאתה מעדכן את ה-State:
const [currentTasks, setCurrentTasks] = useState<ContainerTask[]>([]);

// ובשורת השגיאה (שורה 25):
const hasEmergency = currentTasks.some((t: ContainerTask) => t.status === "SCHEDULED_SWAP");
