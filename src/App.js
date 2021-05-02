import './App.css';
import {Container, Navbar} from "react-bootstrap";
import CameraListView from "./view/CameraListView";

const App = () => {
    return (
        <div>
            <Navbar bg="dark" variant="dark" className="mb-5">
                <Navbar.Brand href="#">
                    Occupancy Meter Dashboard
                </Navbar.Brand>
            </Navbar>

            <Container>
                <CameraListView/>
            </Container>
        </div>
    )
}

export default App;
