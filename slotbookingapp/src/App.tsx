import { Route, Routes } from "react-router-dom";
import './App.css';
import AppointmentScheduler from './AppointmentScheduler';
import LoginPage from './Components/LoginPage';
import Dumy from './Dumy'
import { Box } from "@chakra-ui/react";

function App() {
  return (
        <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      h="100vh"
      bgGradient="linear(to-r, purple.500, pink.500)"
      color="white"
    >
      <Routes>
        <Route path="/" Component={LoginPage} />
        <Route path="/home" Component={AppointmentScheduler} />
      </Routes>
    </Box>
  );
}

export default App;
