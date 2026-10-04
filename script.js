const KEY='tybca_sms_v2';
const subjects=['Communication Network','DBMS','Software Engineering','Web Technology','Programming'];
const demoStudents=[
 {id:'s1',roll:1,name:'Aarav Patil',prn:'TYBCA001',course:'TYBCA',division:'A',phone:'9876543210',email:'aarav@example.com',gender:'Male',attendance:{}},
 {id:'s2',roll:2,name:'Sneha Jadhav',prn:'TYBCA002',course:'TYBCA',division:'A',phone:'9876543211',email:'sneha@example.com',gender:'Female',attendance:{}},
 {id:'s3',roll:3,name:'Rahul Shinde',prn:'TYBCA003',course:'TYBCA',division:'B',phone:'9876543212',email:'rahul@example.com',gender:'Male',attendance:{}},
 {id:'s4',roll:4,name:'Priya More',prn:'TYBCA004',course:'TYBCA',division:'B',phone:'9876543213',email:'priya@example.com',gender:'Female',attendance:{}},
 {id:'s5',roll:5,name:'Om Kulkarni',prn:'TYBCA005',course:'TYBCA',division:'A',phone:'9876543214',email:'om@example.com',gender:'Male',attendance:{}}
];
let db=loadDB();
db.settings=db.settings||{college:'TYBCA College',year:'2026-27'};
db.marks=Array.isArray(db.marks)?db.marks:[];
let selectedDate=new Date().toISOString().slice(0,10);

function defaultDB(){
 const db={students:demoStudents,marks:[],settings:{college:'TYBCA College',year:'2026-27'},theme:'light'};
 seedDemoAttendance(db); return db;
}
function seedDemoAttendance(db){
 const dates=[]; for(let i=1;i<=5;i++){const d=new Date();d.setDate(d.getDate()-i);dates.push(d.toISOString().slice(0,10));}
 db.students.forEach((s,idx)=>dates.forEach((d,j)=>s.attendance[d]=((idx+j)%5===0)?'Absent':'Present'));
 db.marks=[{id:'m1',studentId:'s1',subject:'DBMS',internal:26,external:61},{id:'m2',studentId:'s2',subject:'DBMS',internal:24,external:58},{id:'m3',studentId:'s3',subject:'Communication Network',internal:22,external:55}];
}
function loadDB(){try{const raw=localStorage.getItem(KEY);if(raw)return JSON.parse(raw)}catch(e){}return defaultDB()}
function saveDB(){localStorage.setItem(KEY,JSON.stringify(db));refreshAll()}
function el(id){return document.getElementById(id)}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function showToast(msg){const t=el('toast');t.textContent=msg;t.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>t.classList.remove('show'),2300)}
function showPage(page){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active-page'));el(page+'Page').classList.add('active-page');document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));el('pageTitle').textContent=page[0].toUpperCase()+page.slice(1);refreshAll();window.scrollTo(0,0)}
function refreshAll(){renderDashboard();renderStudents();renderAttendance();renderMarks();renderReports();el('todayLabel').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short',year:'numeric'});}
function openModal(id){el(id).classList.remove('hidden')}function closeModal(id){el(id).classList.add('hidden')}

function renderDashboard(){
 const today=selectedDate;const total=db.students.length;let p=0,a=0,marked=0;db.students.forEach(s=>{if(s.attendance[today]==='Present'){p++;marked++}else if(s.attendance[today]==='Absent'){a++;marked++}});
 el('statStudents').textContent=total;el('statPresent').textContent=p;el('statAbsent').textContent=a;el('statAttendance').textContent=marked?Math.round(p/marked*100)+'%':'0%';
 el('attendanceSummary').innerHTML=`<div class="progress"><span style="width:${marked?Math.round(p/marked*100):0}%"></span></div><p class="muted">${p} present • ${a} absent • ${total-marked} not marked today</p>`;
 const low=db.students.map(attStats).filter(x=>x.marked&&x.percent<75).sort((a,b)=>a.percent-b.percent).slice(0,5);
 el('lowAttendanceList').innerHTML=low.length?low.map(x=>`<div class="list-row"><b>${esc(x.student.name)}</b><span class="badge low">${x.percent}%</span></div>`).join(''):'<p class="muted">No students below 75%.</p>';
 el('recentStudents').innerHTML=db.students.slice(-5).reverse().map(s=>`<tr><td>${s.roll}</td><td><b>${esc(s.name)}</b></td><td>${esc(s.prn)}</td><td>${esc(s.course)}</td><td>${esc(s.division)}</td></tr>`).join('')||emptyRow(5,'No students yet.');
}
function attStats(student){let p=0,a=0;Object.values(student.attendance||{}).forEach(v=>{if(v==='Present')p++;if(v==='Absent')a++});const marked=p+a;return{student,p,a,marked,percent:marked?Math.round(p/marked*100):0}}
function emptyRow(cols,msg){return `<tr><td colspan="${cols}" class="muted">${msg}</td></tr>`}

function renderStudents(){
 const q=(el('studentSearch')?.value||'').toLowerCase();const c=el('courseFilter')?.value||'';const d=el('divisionFilter')?.value||'';
 const list=db.students.filter(s=>(!q||`${s.name} ${s.roll} ${s.prn} ${s.division}`.toLowerCase().includes(q))&&(!c||s.course===c)&&(!d||s.division===d));
 el('studentsTable').innerHTML=list.map(s=>`<tr><td>${s.roll}</td><td><b>${esc(s.name)}</b><small class="muted">${esc(s.email||'')}</small></td><td>${esc(s.prn)}</td><td>${esc(s.course)}</td><td>${esc(s.division)}</td><td>${esc(s.phone||'-')}</td><td><div class="row-actions"><button class="small-btn" onclick="editStudent('${s.id}')">Edit</button><button class="small-btn delete" onclick="deleteStudent('${s.id}')">Delete</button></div></td></tr>`).join('')||emptyRow(7,'No matching students.');
}
function openStudentModal(id=null){
 el('studentForm').reset();el('editStudentId').value='';el('studentRoll').value=db.students.length?Math.max(...db.students.map(s=>s.roll))+1:1;el('studentModalTitle').textContent='Add Student';
 if(id){const s=db.students.find(x=>x.id===id);if(!s)return;el('editStudentId').value=s.id;el('studentModalTitle').textContent='Edit Student';['studentRoll','studentName','studentPrn','studentCourse','studentDivision','studentPhone','studentEmail','studentGender'].forEach(k=>{const map={studentRoll:'roll',studentName:'name',studentPrn:'prn',studentCourse:'course',studentDivision:'division',studentPhone:'phone',studentEmail:'email',studentGender:'gender'};el(k).value=s[map[k]]||''})}openModal('studentModal')}
function editStudent(id){openStudentModal(id)}
function deleteStudent(id){if(!confirm('Delete this student and related marks?'))return;db.students=db.students.filter(s=>s.id!==id);db.marks=db.marks.filter(m=>m.studentId!==id);saveDB();showToast('Student deleted')}
el('studentForm').addEventListener('submit',e=>{e.preventDefault();const id=el('editStudentId').value;const data={roll:Number(el('studentRoll').value),name:el('studentName').value.trim(),prn:el('studentPrn').value.trim(),course:el('studentCourse').value,division:el('studentDivision').value,phone:el('studentPhone').value.trim(),email:el('studentEmail').value.trim(),gender:el('studentGender').value};if(!data.name||!data.prn)return;if(id){const s=db.students.find(x=>x.id===id);Object.assign(s,data)}else{data.id='s'+Date.now();data.attendance={};db.students.push(data)}saveDB();closeModal('studentModal');showToast(id?'Student updated':'Student added')});

function renderAttendance(){
 el('attendanceDate').value=selectedDate;let p=0,a=0,u=0;const subj=el('attendanceSubject')?.value||'All Subjects';
 el('attendanceTable').innerHTML=db.students.map(s=>{const status=s.attendance[selectedDate]||'Not Marked';if(status==='Present')p++;else if(status==='Absent')a++;else u++;return `<tr><td>${s.roll}</td><td><b>${esc(s.name)}</b></td><td>${s.division}</td><td><span class="badge ${status==='Present'?'present':status==='Absent'?'absent':'pending'}">${status}</span></td><td><div class="attendance-actions"><button class="present-action" onclick="setAttendance('${s.id}','Present')">Present</button><button class="absent-action" onclick="setAttendance('${s.id}','Absent')">Absent</button></div></td></tr>`}).join('')||emptyRow(5,'No students.');
 el('attPresent').textContent=p;el('attAbsent').textContent=a;el('attUnmarked').textContent=u;
}
function setAttendance(id,status){const s=db.students.find(x=>x.id===id);if(s){s.attendance[selectedDate]=status;saveDB();showToast(`${s.name}: ${status}`)}}
function markAll(status){db.students.forEach(s=>s.attendance[selectedDate]=status);saveDB();showToast(`All students marked ${status}`)}

function renderMarks(){const q=(el('marksSearch')?.value||'').toLowerCase();const subj=el('marksSubjectFilter')?.value||'';const rows=db.marks.filter(m=>{const s=db.students.find(x=>x.id===m.studentId);return s&&(!q||s.name.toLowerCase().includes(q))&&(!subj||m.subject===subj)});el('marksTable').innerHTML=rows.map(m=>{const s=db.students.find(x=>x.id===m.studentId);const total=m.internal+m.external;const pct=Math.round(total);const grade=pct>=90?'A+':pct>=80?'A':pct>=70?'B+':pct>=60?'B':pct>=50?'C':pct>=40?'D':'F';return `<tr><td>${s.roll}</td><td>${esc(s.name)}</td><td>${esc(m.subject)}</td><td>${m.internal}/30</td><td>${m.external}/70</td><td>${total}/100</td><td>${pct}%</td><td><span class="badge ${grade==='F'?'absent':'good'}">${grade}</span></td><td><button class="small-btn delete" onclick="deleteMarks('${m.id}')">Delete</button></td></tr>`}).join('')||emptyRow(9,'No marks recorded.');}
function openMarksModal(){const sel=el('marksStudent');sel.innerHTML=db.students.map(s=>`<option value="${s.id}">${s.roll} - ${esc(s.name)}</option>`).join('');el('internalMarks').value='';el('externalMarks').value='';openModal('marksModal')}
el('marksForm').addEventListener('submit',e=>{e.preventDefault();const studentId=el('marksStudent').value,subject=el('marksSubject').value,internal=Number(el('internalMarks').value),external=Number(el('externalMarks').value);const existing=db.marks.find(m=>m.studentId===studentId&&m.subject===subject);if(existing)Object.assign(existing,{internal,external});else db.marks.push({id:'m'+Date.now(),studentId,subject,internal,external});saveDB();closeModal('marksModal');showToast('Marks saved')});
function deleteMarks(id){db.marks=db.marks.filter(m=>m.id!==id);saveDB();showToast('Marks deleted')}

function renderReports(){const stats=db.students.map(attStats);const marked=stats.reduce((x,s)=>x+s.marked,0),present=stats.reduce((x,s)=>x+s.p,0),pct=marked?Math.round(present/marked*100):0;el('reportAttendance').textContent=pct+'%';el('reportProgress').style.width=pct+'%';el('reportStudents').textContent=db.students.length;el('reportAttendanceText').textContent=`${present} present records out of ${marked} marked attendance records.`;const threshold=Number(el('reportThreshold')?.value||75);const low=stats.filter(s=>s.marked&&s.percent<threshold);el('reportLow').textContent=low.length;el('reportTable').innerHTML=stats.map(s=>`<tr><td>${s.student.roll}</td><td>${esc(s.student.name)}</td><td>${s.p}</td><td>${s.a}</td><td>${s.marked}</td><td>${s.percent}%</td><td><span class="badge ${s.marked&&s.percent<threshold?'low':'good'}">${s.marked&&s.percent<threshold?'Needs Attention':'Good'}</span></td></tr>`).join('')||emptyRow(7,'No attendance data.');}
function exportCSV(){const rows=[['Roll','Student','PRN','Course','Division','Present','Absent','Marked Days','Attendance %']];db.students.forEach(s=>{const x=attStats(s);rows.push([s.roll,s.name,s.prn,s.course,s.division,x.p,x.a,x.marked,x.percent])});const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');download('student_attendance_report.csv','text/csv;charset=utf-8',csv);showToast('CSV exported')}
function download(name,type,data){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function printReport(){window.print()}

function updateTheme(){document.body.classList.toggle('dark',db.theme==='dark');el('themeBtn').textContent=db.theme==='dark'?'☀️ Light Theme':'🌙 Toggle Theme'}
el('themeBtn').addEventListener('click',()=>{db.theme=db.theme==='dark'?'light':'dark';saveDB();updateTheme()});
el('logoutBtn').addEventListener('click',()=>{sessionStorage.removeItem('tybca_logged');location.reload()});
el('loginForm').addEventListener('submit',e=>{e.preventDefault();if(el('loginUsername').value==='admin'&&el('loginPassword').value==='admin123'){sessionStorage.setItem('tybca_logged','1');el('loginScreen').classList.add('hidden');el('app').classList.remove('hidden');refreshAll();updateTheme()}else showToast('Invalid demo login')});
el('studentSearch').addEventListener('input',renderStudents);el('courseFilter').addEventListener('change',renderStudents);el('divisionFilter').addEventListener('change',renderStudents);el('marksSearch').addEventListener('input',renderMarks);el('marksSubjectFilter').addEventListener('change',renderMarks);el('reportThreshold').addEventListener('change',renderReports);
el('attendanceDate').addEventListener('change',e=>{selectedDate=e.target.value;refreshAll()});el('markAllPresent').addEventListener('click',()=>markAll('Present'));el('markAllAbsent').addEventListener('click',()=>markAll('Absent'));
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>{showPage(b.dataset.page);closeMobileMenu();}));
function closeMobileMenu(){el('sidebar').classList.remove('open');el('menuOverlay').classList.remove('show');}
el('mobileMenu').addEventListener('click',()=>{el('sidebar').classList.add('open');el('menuOverlay').classList.add('show');});
el('closeMenu').addEventListener('click',closeMobileMenu);
el('menuOverlay').addEventListener('click',closeMobileMenu);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMobileMenu();});
el('saveSettings').addEventListener('click',()=>{db.settings.college=el('collegeName').value.trim()||'TYBCA College';db.settings.year=el('academicYear').value.trim()||'2026-27';saveDB();showToast('Settings saved')});
el('backupBtn').addEventListener('click',()=>download('tybca_sms_backup.json','application/json',JSON.stringify(db,null,2)));
el('restoreInput').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.students||!Array.isArray(x.students))throw Error();db=x;saveDB();showToast('Backup restored')}catch{showToast('Invalid backup file')}};r.readAsText(f)});
el('resetBtn').addEventListener('click',()=>{if(confirm('Reset all local data to demo data?')){db=defaultDB();saveDB();showToast('Demo data restored')}});

// Initialize
el('collegeName').value=db.settings.college;el('academicYear').value=db.settings.year;updateTheme();
if(sessionStorage.getItem('tybca_logged')==='1'){el('loginScreen').classList.add('hidden');el('app').classList.remove('hidden');refreshAll()}else{el('app').classList.add('hidden')}
