import Layout from "./Layout.jsx";

import AdminDashboard from "./AdminDashboard";

import Announcements from "./Announcements";

import AssignmentProfile from "./AssignmentProfile";

import Assignments from "./Assignments";

import Attendance from "./Attendance";

import AuditReport from "./AuditReport";

import Calendar from "./Calendar";

import CheckIn from "./CheckIn";

import CourseProfile from "./CourseProfile";

import Courses from "./Courses";

import Dashboard from "./Dashboard";

import Demo from "./Demo";

import GuideExample from "./GuideExample";

import GuideExampleAdvanced from "./GuideExampleAdvanced";

import GuideHTMLTemplate from "./GuideHTMLTemplate";

import Home from "./Home";

import JoinCourse from "./JoinCourse";

import Marketing from "./Marketing";

import Material from "./Material";

import Materials from "./Materials";

import Messages from "./Messages";

import Privacy from "./Privacy";

import PublicView from "./PublicView";

import QRAttendance from "./QRAttendance";

import SessionProfile from "./SessionProfile";

import Sessions from "./Sessions";

import Settings from "./Settings";

import StudentProfile from "./StudentProfile";

import Students from "./Students";

import Terms from "./Terms";

import TestGuideForm from "./TestGuideForm";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    AdminDashboard: AdminDashboard,
    
    Announcements: Announcements,
    
    AssignmentProfile: AssignmentProfile,
    
    Assignments: Assignments,
    
    Attendance: Attendance,
    
    AuditReport: AuditReport,
    
    Calendar: Calendar,
    
    CheckIn: CheckIn,
    
    CourseProfile: CourseProfile,
    
    Courses: Courses,
    
    Dashboard: Dashboard,
    
    Demo: Demo,
    
    GuideExample: GuideExample,
    
    GuideExampleAdvanced: GuideExampleAdvanced,
    
    GuideHTMLTemplate: GuideHTMLTemplate,
    
    Home: Home,
    
    JoinCourse: JoinCourse,
    
    Marketing: Marketing,
    
    Material: Material,
    
    Materials: Materials,
    
    Messages: Messages,
    
    Privacy: Privacy,
    
    PublicView: PublicView,
    
    QRAttendance: QRAttendance,
    
    SessionProfile: SessionProfile,
    
    Sessions: Sessions,
    
    Settings: Settings,
    
    StudentProfile: StudentProfile,
    
    Students: Students,
    
    Terms: Terms,
    
    TestGuideForm: TestGuideForm,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<AdminDashboard />} />
                
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/Announcements" element={<Announcements />} />
                
                <Route path="/AssignmentProfile" element={<AssignmentProfile />} />
                
                <Route path="/Assignments" element={<Assignments />} />
                
                <Route path="/Attendance" element={<Attendance />} />
                
                <Route path="/AuditReport" element={<AuditReport />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/CheckIn" element={<CheckIn />} />
                
                <Route path="/CourseProfile" element={<CourseProfile />} />
                
                <Route path="/Courses" element={<Courses />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Demo" element={<Demo />} />
                
                <Route path="/GuideExample" element={<GuideExample />} />
                
                <Route path="/GuideExampleAdvanced" element={<GuideExampleAdvanced />} />
                
                <Route path="/GuideHTMLTemplate" element={<GuideHTMLTemplate />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/JoinCourse" element={<JoinCourse />} />
                
                <Route path="/Marketing" element={<Marketing />} />
                
                <Route path="/Material" element={<Material />} />
                
                <Route path="/Materials" element={<Materials />} />
                
                <Route path="/Messages" element={<Messages />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/PublicView" element={<PublicView />} />
                
                <Route path="/QRAttendance" element={<QRAttendance />} />
                
                <Route path="/SessionProfile" element={<SessionProfile />} />
                
                <Route path="/Sessions" element={<Sessions />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/StudentProfile" element={<StudentProfile />} />
                
                <Route path="/Students" element={<Students />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/TestGuideForm" element={<TestGuideForm />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}