import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignIn from "./screens/auth/SignIn";
import ForgotPassword from "./screens/auth/ForgotPassword";
import SignUp from "./screens/auth/SignUp";
import ProfileDetails from "./screens/auth/ProfileDetails";
import Main from "./screens/teams/Main";
import { AuthProvider } from "./contexts/AuthContext";
import TeamView from "./screens/teams/TeamView";
import Meeting from "./screens/teams/Meeting";
import MainTasks from "./screens/tasks/MainTasks";
import TaskView from "./screens/tasks/TaskView";

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>

        {/* Auth */}
        <Route exact path="/" element={<SignIn />} />
        <Route exact path="/sign-in" element={<SignIn />} />
        <Route exact path="/forgot-password" element={<ForgotPassword />} />
        <Route exact path="/sign-up" element={<SignUp />} />
        <Route exact path="/profile-details" element={<ProfileDetails />} />

        {/* Teams */}
        <Route exact path="/teams" element={<Main />} />
        <Route exact path="/teams/:teamId" element={<TeamView />} />
        <Route exact path="/teams/:teamId/meeting/:meetingId" element={<Meeting />} />

        {/* Tasks */}
        <Route exact path="/tasks" element={<MainTasks />} />
        <Route exact path="/tasks/:taskId" element={<TaskView />} />
      </Routes>
      
    </Router>
    </AuthProvider>
  );
}

export default App;
