import React, {useState, useEffect} from 'react'
import {Badge, Button, Col, Row, Spinner, Table} from "react-bootstrap";
import {Link, useHistory} from "react-router-dom";
import {Wifi, WifiOff} from "react-bootstrap-icons";

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
     * Boolean of de pagina aan het laden is of niet
     */
    const [isSending, setIsSending] = useState(false)

    /*
     * Boolean of het toevoegen van de camera is voltooid
     */
    const [isDone,    setIsDone]    = useState(false)

    /*
     * null of String die aangeeft of er een error is opgetreden
     */
    const [error,     setError]     = useState(null)

    /*
     * Functie die bij het laden van de pagina aangeroepen wordt.
     * Hij haalt de JSON data met de camera info array van de REST endpoint op.
     */
    useEffect(() => {
        load()
    }, [])


    /*
     * Functie die met een POST request de data in JSON-formaat naar de server stuurt
     */

    const send = () => {
        setIsSending(true);

        fetch(`/camera/delete`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    "name":   cameras[0].name
                }
            ),
        }).then(response => {
            setIsSending(false);
            load();

            switch (response.status) {
                // Aanmaken successvol
                case 201:
                    setIsDone(true);
                    break;
                default:
                    setError("Server error, kijk in de debugging tab van je browser welke error het is");
                    break;
            }
        })
    }

    /*
     * Functie die met een GET request de data in JSON-formaat van de server ontvangt. 
     */

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
                        <CameraTable cameras={cameras} history={history} send={send}/>
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

const DeleteButton = ({deleteButton}) => {
    return (
        <Button variant="primary" className="w-100" onClick={deleteButton}>
            Verwijderen
        </Button>
    )
}

/*
 * Knop welke redirect naar de "/camera/new" waarin een nieuwe camera toegevoegd kan worden.
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


const CameraTable = ({cameras, history, send}) => {
    if (cameras.length <= 0) {
        return(
            <tr>
                <td>Geen data</td>
                <td>Geen data</td>
                <td>Geen data</td>
                <td>Geen data</td>
                <td>Geen data</td>
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
                    <td><DeleteButton deleteButton={send}></DeleteButton></td>
                </tr>
            )
        )
    }
}

/*
 * Live tonen van de status van de camera. Deze is "verbonden" of "offine".
 */

const CameraStateBadge = ({camera}) => {
    switch (camera.is_online) {
        case true:
            return (
                <Badge variant="success">
                    <Wifi/>
                    &nbsp;
                    Verbonden
                </Badge>
            )
        default:
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