import React, {useState, useEffect} from 'react'
import {Button, Col, Row, Spinner, Table} from "react-bootstrap";
import {Link, useHistory} from "react-router-dom";

const CameraListView = () => {

    /*
     * Array met alle cameras
     */
    const [cameras, setCameras] = useState([])

    /*
     * Boolean of de pagina aan het laden is of niet
     */
    const [isLoading, setIsLoading] = useState(false)

    const history = useHistory()

    /*
     * Functie die bij het laden van de pagina aangeroepen wordt.
     * Hij haalt de JSON data met de camera info array van de REST endpoint op.
     */
    useEffect(() => {
        load()
    }, [])

    const load = () => {
        setIsLoading(true);

        fetch(`/camera`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        })
        .then(response => response.json())
        .then(cameras => {
            setCameras(cameras)
            setIsLoading(false)
        })
        .catch(error => {
            // TODO laat error message zien ofzo
        })
    }

    /*
     * Als de REST call nog bezig is, laat een animatie zien
     */
    if (isLoading) {
        return (
            <div>
                <Spinner animation="border" role="status">
                    <span className="sr-only">Laden... als dit lang duurt dan doet je setup het waarschijnlijk niet.... check browser console voor errors enzo</span>
                </Spinner>
            </div>
        )
    } else {
        return (
            <div>
                <Row>
                    <Col xs={{span: 8}}>
                        <h2>Lijst met camera's</h2>
                    </Col>
                    <Col xs={{span: 2}}>
                        <RefreshButton refreshFunction={load} />
                    </Col>
                    <Col xs={{span: 2}}>
                        <CameraAddButton/>
                    </Col>
                </Row>

                <Table striped bordered hover className="my-3">
                    <thead>
                        <tr>
                            <th>Naam</th>
                            <th>Camera IP</th>
                            <th>VPS IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        <CameraTable cameras={cameras} history={history}/>
                    </tbody>
                </Table>
            </div>
        )
    }
}

const RefreshButton = ({refreshFunction}) => {
    return (
        <Button variant="primary" className="w-100" onClick={refreshFunction}>
            Refresh
        </Button>
    )
}

const CameraAddButton = () => {
    return (
        <Link to="/camera/new">
            <Button variant="primary" className="w-100">
                Voeg toe...
            </Button>
        </Link>
    )
}

const CameraTable = ({cameras, history}) => {
    if (cameras.length <= 0) {
        return(
            <tr>
                <td>Geen data</td>
                <td>Geen data</td>
                <td>Geen data</td>
            </tr>
        )
    } else {
        return (
            cameras.map(camera =>
                <tr onClick={() => history.push("/history/" + camera.name)}>
                    <td>{camera.name}</td>
                    <td>{camera.cam_ip}</td>
                    <td>{camera.vps_ip}</td>
                </tr>
            )
        )
    }
}

export default CameraListView