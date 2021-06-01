import React, {useState, useEffect} from 'react'
import {Badge, Button, Col, Row, Spinner, Table} from "react-bootstrap";
import {Link, useHistory} from "react-router-dom";
import {Wifi, WifiOff} from "react-bootstrap-icons";

/*
 * Component met een lijst van alle cameras
 */
const CameraListView = () => {

    /*
     * Array met alle cameras
     */
    const [cameras, setCameras] = useState([])

    /*
     * Boolean of de pagina aan het laden is of niet
     */
    const [isLoading, setIsLoading] = useState(false)

    /*
     * react-router history object
     */
    const history = useHistory()

    /*
     * Functie die bij het laden van de pagina aangeroepen wordt.
     * Hij haalt de JSON data met de camera info array van de REST endpoint op.
     */
    useEffect(() => load(), [])

    /*
     * Functie die met een GET request de data in JSON-formaat van de server ontvangt. 
     */
    const load = () => {
        setIsLoading(true);

        // Stuur een HTTP GET request naar de /camera REST-endpoint
        fetch(`/camera`, {
            method: 'GET',
            headers: {
                // Accepteer een antwoord in JSON formaat
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        // Wanneer er een antwoord binnen is:
        // Unpack de JSON naar een Javascript object
        .then(response => response.json())
        // Set de cameras array
        .then(cameras => {
            setCameras(cameras)
            setIsLoading(false)
        })
        // Mocht er een fout zijn opgetreden:
        .catch(error => {
            console.log("Fout bij het ophalen van de data")
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
                    <colgroup>
                        <col className={"w-25"}/>
                        <col className={"w-25"}/>
                        <col className={"w-25"}/>
                        <col className={"w-25"}/>
                        <col className={"w-25"}/>
                    </colgroup>
                    <thead>
                        <tr>
                            <th>Naam</th>
                            <th>Camera IP</th>
                            <th>VPS IP</th>
                            <th>Status</th>
                            <th>Verwijderen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <CameraTable cameras={cameras} history={history} reloadFunction={load}/>
                    </tbody>
                </Table>
            </div>
        )
    }
}

/*
 * Knop om de pagina te herladen.
 */
const RefreshButton = ({refreshFunction}) => {
    return (
        <Button variant="primary" className="w-100" onClick={refreshFunction}>
            Refresh
        </Button>
    )
}

/*
 * Knop om de een camera uit de lijst te verwijderen.
 */
const DeleteButton = ({cameraName, onCompleted}) => {

    /*
     * Functie die een DELETE request naar de /camera/:naam REST-Endpoint stuurt, waar de :naam parameter
     * de naam van de huidige camera is
     */
    const send = () => {
        fetch(`/camera/` + cameraName, {
            method: 'DELETE',
        }).then(response => {
            onCompleted();

            // Check de HTTP status code van het antwoord
            switch (response.status) {
                // Aanmaken successvol
                case 201:
                    break;
                // Fout
                default:
                    console.log("Camera delete fout " + response.status)
                    break;
            }
        })
    }

    return (
        <Button variant="primary" className="w-100" size="sm" onClick={send}>
            Verwijderen
        </Button>
    )
}

/*
 * Knop welke redirect naar de "/camera/new" pagina (zie de react-router in App.js) waarin een nieuwe camera toegevoegd kan worden.
 */
const CameraAddButton = () => {
    return (
        <Link to="/camera/new">
            <Button variant="primary" className="w-100">
                Voeg toe...
            </Button>
        </Link>
    )
}

/*
 * Maakt de tabel aan waarin de naam, het IP van de camera, het IP van de vps, de status van de camera en de verwijderknop
 * worden getoond.
 */
const CameraTable = ({cameras, history, reloadFunction}) => {
    // Als er geen cameras zijn gevonden
    if (cameras.length <= 0) {
        return(
            <tr>
                <td colSpan={5} className="text-center py-5">Geen data</td>
            </tr>
        )
    } else {
        return (
            cameras.map(camera =>
                <tr>
                    <td onClick={() => history.push("/history/" + camera.name)}>{camera.name}</td>
                    <td onClick={() => history.push("/history/" + camera.name)}>{camera.cam_ip}</td>
                    <td onClick={() => history.push("/history/" + camera.name)}>{camera.vps_ip}</td>
                    <td onClick={() => history.push("/history/" + camera.name)}>
                        <CameraStateBadge camera={camera}/>
                    </td>
                    <td>
                        <DeleteButton cameraName={camera.name} onCompleted={reloadFunction}/>
                    </td>
                </tr>
            )
        )
    }
}

/*
 * Live tonen van de status van de camera. Deze is "verbonden" of "offine".
 */
const CameraStateBadge = ({camera}) => {
    // Check of de camera online is
    switch (camera.is_online) {
        case /*online*/ true:
            return (
                <Badge variant="success">
                    <Wifi/>
                    &nbsp;
                    Verbonden
                </Badge>
            )
        default: /*offline*/
            return (
                <Badge variant="danger">
                    <WifiOff/>
                    &nbsp;
                    Offline
                </Badge>
            )
    }
}

export default CameraListView