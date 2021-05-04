import './App.css';
import {Container, Navbar} from "react-bootstrap";
import {Route, Redirect, Switch, BrowserRouter} from 'react-router-dom';

import CameraListView from "./view/CameraListView";
import CameraCreateView from "./view/CameraCreateView";

const App = () => {
    return (
        <div>
            <Navbar bg="dark" variant="dark" className="mb-5">
                <Navbar.Brand href="#">
                    Occupancy Meter Dashboard
                </Navbar.Brand>
            </Navbar>

            <Container>
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/" render={() => <Redirect to="/camera/list"/>}/>

                        <Route       path="/camera/list" component={CameraListView} />
                        <Route       path="/camera/new"  component={CameraCreateView} />
                    </Switch>
                </BrowserRouter>
            </Container>
        </div>
    )
}

export default App;
