import { BrowserRouter, Routes, Route } from "react-router-dom";
import CompletaProfilo from "../CompletaProfilo"
import DashboardCittadino from "../DashboardCittadino"
import Accesso from "../Accesso"
function AppRoutes() {
  return (
    <Routes>
        <route path="/" element={<Accesso />} />
        <route path="/dashboard" element={<DashboardCittadino />} />
        <route path="/completa-profilo:id" element={<CompletaProfilo/>}/>
    </Routes>
  )
}
export default AppRoutes