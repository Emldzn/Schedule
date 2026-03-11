import { v4 as uuidv4 } from 'uuid'

export const DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб']

export const TIME_SLOTS = [
  { id:1,  start:'8:30',  end:'9:10'  },
  { id:2,  start:'9:15',  end:'9:55'  },
  { id:3,  start:'10:00', end:'10:40' },
  { id:4,  start:'10:45', end:'11:25' },
  { id:5,  start:'11:30', end:'12:10' },
  { id:6,  start:'13:00', end:'13:40' },
  { id:7,  start:'13:45', end:'14:25' },
  { id:8,  start:'14:30', end:'15:10' },
  { id:9,  start:'15:15', end:'15:55' },
  { id:10, start:'16:00', end:'16:40' },
]

export const DIRECTIONS = ['SCA','MAR','ACO','CSC','DES']
export const DIRECTION_LABELS = {
  SCA:'Software & Cloud Architecture',
  MAR:'Marketing & Analytics',
  ACO:'Accounting & Operations',
  CSC:'Computer Science & Cybersecurity',
  DES:'Design & Media',
}
export const DIR_COLORS = {
  SCA:{ bg:'#eff6ff', border:'#bfdbfe', text:'#1d4ed8', dot:'#3b82f6' },
  MAR:{ bg:'#fffbeb', border:'#fde68a', text:'#b45309', dot:'#f59e0b' },
  ACO:{ bg:'#ecfdf5', border:'#a7f3d0', text:'#065f46', dot:'#10b981' },
  CSC:{ bg:'#f5f3ff', border:'#ddd6fe', text:'#5b21b6', dot:'#8b5cf6' },
  DES:{ bg:'#fdf2f8', border:'#fbcfe8', text:'#9d174d', dot:'#ec4899' },
}

// Subject color palette - soft, readable
export const SUBJECT_COLORS = [
  { bg:'#eff6ff', text:'#1d4ed8', border:'#bfdbfe' },
  { bg:'#ecfdf5', text:'#065f46', border:'#a7f3d0' },
  { bg:'#fef3c7', text:'#92400e', border:'#fde68a' },
  { bg:'#fdf2f8', text:'#9d174d', border:'#fbcfe8' },
  { bg:'#f5f3ff', text:'#5b21b6', border:'#ddd6fe' },
  { bg:'#f0f9ff', text:'#0c4a6e', border:'#bae6fd' },
  { bg:'#fef2f2', text:'#991b1b', border:'#fecaca' },
  { bg:'#f0fdf4', text:'#14532d', border:'#bbf7d0' },
  { bg:'#fff7ed', text:'#7c2d12', border:'#fed7aa' },
  { bg:'#fafafa', text:'#3f3f46', border:'#e4e4e7' },
]

export const makeGroups = () => {
  const out = []
  DIRECTIONS.forEach(dir => {
    for (let c=1; c<=3; c++) { // max 3 courses
      ;['A','B'].forEach(sub => {
        out.push({ id:uuidv4(), name:`${dir}-${c}${sub}`, direction:dir, course:c, subgroup:sub })
      })
    }
  })
  return out
}

export const makeTeachers = () => [
  { id:uuidv4(), name:'Kubanychbek Zh.',  short:'Kubanychbek',  subjects:['Web Development','Computer Networks'] },
  { id:uuidv4(), name:'Zhyldyz M.',        short:'Zhyldyz',       subjects:['English Language'] },
  { id:uuidv4(), name:'Gulnura A.',        short:'Gulnura',       subjects:['Manas Literature','Kyrgyz Language'] },
  { id:uuidv4(), name:'Azat Sh.',          short:'Azat',          subjects:['Physical Training'] },
  { id:uuidv4(), name:'Emilbek Zh.',       short:'Emilbek',       subjects:['Government & Society'] },
  { id:uuidv4(), name:'Mirlan N.',         short:'Mirlan',        subjects:['Algorithmization','Database Management'] },
  { id:uuidv4(), name:'Nurmukhamed A.',    short:'Nurmukhamed',   subjects:['Digital Marketing'] },
  { id:uuidv4(), name:'Toktokan S.',       short:'Toktokan',      subjects:['Manas Literature'] },
  { id:uuidv4(), name:'Khadidzha T.',      short:'Khadidzha',     subjects:['Administration'] },
  { id:uuidv4(), name:'Edil T.',           short:'Edil',          subjects:['Database Management'] },
  { id:uuidv4(), name:'Temirlan A.',       short:'Temirlan',      subjects:['Turkish Language','German','French'] },
  { id:uuidv4(), name:'Zulkada R.',        short:'Zulkada',       subjects:['Turkish Language'] },
]

export const makeSubjects = () => [
  { id:uuidv4(), name:'Web Development',     short:'Web',          colorIdx:0, room:'C001 Lab', weeklyHours:2 },
  { id:uuidv4(), name:'English Language',    short:'English',      colorIdx:1, room:'C402',     weeklyHours:4 },
  { id:uuidv4(), name:'Physical Training',   short:'PhTrain',      colorIdx:9, room:'SH',       weeklyHours:2 },
  { id:uuidv4(), name:'Algorithmization',    short:'Algorithmize', colorIdx:4, room:'C001 Lab', weeklyHours:4 },
  { id:uuidv4(), name:'Talking Club',        short:'Talk.Club',    colorIdx:3, room:'C404',     weeklyHours:2 },
  { id:uuidv4(), name:'Database Management', short:'DB',           colorIdx:4, room:'C205 Lab', weeklyHours:2 },
  { id:uuidv4(), name:'Manas Literature',    short:'Manas',        colorIdx:1, room:'C402',     weeklyHours:2 },
  { id:uuidv4(), name:'Digital Marketing',   short:'DMA',          colorIdx:2, room:'C204 Lab', weeklyHours:2 },
  { id:uuidv4(), name:'Turkish Language',    short:'Turkish',      colorIdx:8, room:'C403',     weeklyHours:2 },
  { id:uuidv4(), name:'German Language',     short:'German',       colorIdx:8, room:'C410',     weeklyHours:2 },
  { id:uuidv4(), name:'French Language',     short:'French',       colorIdx:8, room:'C410',     weeklyHours:2 },
  { id:uuidv4(), name:'Government & Society',short:'Gov',          colorIdx:5, room:'C402',     weeklyHours:2 },
  { id:uuidv4(), name:'Administration',      short:'Admin',        colorIdx:3, room:'C402',     weeklyHours:2 },
  { id:uuidv4(), name:'Computer Networks',   short:'Networks',     colorIdx:0, room:'C001 Lab', weeklyHours:2 },
  { id:uuidv4(), name:'UI/UX Design',        short:'UX/UI',        colorIdx:3, room:'C204 Lab', weeklyHours:2 },
  { id:uuidv4(), name:'Mathematics',         short:'Math',         colorIdx:6, room:'C301',     weeklyHours:4 },
  { id:uuidv4(), name:'Accounting Basics',   short:'Accounting',   colorIdx:2, room:'C402',     weeklyHours:2 },
  { id:uuidv4(), name:'Project Management',  short:'ProjMgmt',     colorIdx:5, room:'C402',     weeklyHours:2 },
  { id:uuidv4(), name:'Kyrgyz Language',     short:'Kyrgyz',       colorIdx:7, room:'C402',     weeklyHours:2 },
]

// Users — login = username, password = username (same)
// Admin: login Admin, password Ala-Too2025
// Teachers: ИмяФамилия / ИмяФамилия
// Students: GroupName (e.g. CSC1A) / GroupName
export const DEMO_USERS = [
  // Admin
  { id:'admin-1',    username:'Admin',           password:'Ala-Too2025',  role:'admin',   name:'Администратор',       groupId:null,      teacherId:null },
  // Teachers (login = ИмяФамилия, password = same)
  { id:'t-1',  username:'KubanychbekZh',   password:'KubanychbekZh',  role:'teacher', name:'Kubanychbek Zh.',    groupId:null, teacherId:'__T0__' },
  { id:'t-2',  username:'ZhyldyzM',        password:'ZhyldyzM',       role:'teacher', name:'Zhyldyz M.',         groupId:null, teacherId:'__T1__' },
  { id:'t-3',  username:'GulnuraA',        password:'GulnuraA',       role:'teacher', name:'Gulnura A.',         groupId:null, teacherId:'__T2__' },
  { id:'t-4',  username:'AzatSh',          password:'AzatSh',         role:'teacher', name:'Azat Sh.',           groupId:null, teacherId:'__T3__' },
  { id:'t-5',  username:'EmilbekZh',       password:'EmilbekZh',      role:'teacher', name:'Emilbek Zh.',        groupId:null, teacherId:'__T4__' },
  { id:'t-6',  username:'MirlanN',         password:'MirlanN',        role:'teacher', name:'Mirlan N.',          groupId:null, teacherId:'__T5__' },
  { id:'t-7',  username:'NurmukhamedA',    password:'NurmukhamedA',   role:'teacher', name:'Nurmukhamed A.',     groupId:null, teacherId:'__T6__' },
  { id:'t-8',  username:'ToktokanS',       password:'ToktokanS',      role:'teacher', name:'Toktokan S.',        groupId:null, teacherId:'__T7__' },
  // Students (login = GroupName like SCA1A, password = same)
  { id:'s-1',  username:'SCA1A',  password:'SCA1A',  role:'student', name:'Студент SCA-1A', groupId:'__G_SCA1A__', teacherId:null },
  { id:'s-2',  username:'SCA1B',  password:'SCA1B',  role:'student', name:'Студент SCA-1B', groupId:'__G_SCA1B__', teacherId:null },
  { id:'s-3',  username:'CSC1A',  password:'CSC1A',  role:'student', name:'Студент CSC-1A', groupId:'__G_CSC1A__', teacherId:null },
  { id:'s-4',  username:'CSC2A',  password:'CSC2A',  role:'student', name:'Студент CSC-2A', groupId:'__G_CSC2A__', teacherId:null },
  { id:'s-5',  username:'DES1A',  password:'DES1A',  role:'student', name:'Студент DES-1A', groupId:'__G_DES1A__', teacherId:null },
  { id:'s-6',  username:'MAR1A',  password:'MAR1A',  role:'student', name:'Студент MAR-1A', groupId:'__G_MAR1A__', teacherId:null },
  { id:'s-7',  username:'ACO1A',  password:'ACO1A',  role:'student', name:'Студент ACO-1A', groupId:'__G_ACO1A__', teacherId:null },
]
