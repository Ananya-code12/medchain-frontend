import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { HOME_BY_ROLE } from "./auth/roles";
import RoleGuard from "./components/RoleGuard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Timeline from "./pages/Timeline";
import Upload from "./pages/Upload";
import AccessLog from "./pages/AccessLog";
import Consents from "./pages/Consents";
import LinkWhatsApp from "./pages/LinkWhatsApp";
import PatientSearch from "./pages/provider/PatientSearch";
import ConsentStep from "./pages/provider/ConsentStep";
import PatientRecord from "./pages/provider/PatientRecord";
import UploadReport from "./pages/provider/UploadReport";
import RecordDispense from "./pages/provider/RecordDispense";
import AdminProviders from "./pages/admin/AdminProviders";

// "/" = landing for visitors; signed-in users go straight to their own home.
function Home() { const { user } = useAuth(); return user ? <Navigate to={HOME_BY_ROLE[user.role]} replace /> : <Landing />; }

// Every provider portal: search -> consent code -> its own page. RoleGuard blocks other roles.
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route element={<RoleGuard roles={["patient"]} />}>
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/access-log" element={<AccessLog />} />
          <Route path="/consents" element={<Consents />} />
          <Route path="/whatsapp" element={<LinkWhatsApp />} />
        </Route>

        <Route element={<RoleGuard roles={["doctor"]} />}>
          <Route path="/doctor" element={<PatientSearch />} />
          <Route path="/doctor/consent" element={<ConsentStep />} />
          <Route path="/doctor/record/:patientId" element={<PatientRecord />} />
        </Route>
        <Route element={<RoleGuard roles={["diagnostic"]} />}>
          <Route path="/diagnostic" element={<PatientSearch />} />
          <Route path="/diagnostic/consent" element={<ConsentStep />} />
          <Route path="/diagnostic/upload/:patientId" element={<UploadReport />} />
        </Route>
        <Route element={<RoleGuard roles={["pharmacy"]} />}>
          <Route path="/pharmacy" element={<PatientSearch />} />
          <Route path="/pharmacy/consent" element={<ConsentStep />} />
          <Route path="/pharmacy/dispense/:patientId" element={<RecordDispense />} />
        </Route>

        <Route element={<RoleGuard roles={["admin"]} />}>
          <Route path="/admin" element={<AdminProviders />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
