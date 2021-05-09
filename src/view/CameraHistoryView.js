import React, {useState, useEffect} from 'react'
import {Button, Col, Row, Spinner, Table} from "react-bootstrap";
import {useHistory} from 'react-router-dom';

const CameraHistoryView = ({match}) => {

    /*
     * Array met alle cameras
     */
    const [points, setPoints] = useState([])

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

        fetch(`/history/` + match.params.id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        })
        .then(response => response.json())
        .then(points => {
            setPoints(points)
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
                        <BackButton backFunction={() => history.push("/camera/list")} />
                    </Col>
                </Row>

                <Table striped bordered hover className="my-3">
                    <thead>
                        <tr>
                            <th>Tijdstip</th>
                            <th>Aantal personen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <HistoryTable points={points}/>
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

const BackButton = ({backFunction}) => {
    return (
        <Button variant="primary" className="w-100" onClick={backFunction}>
            Terug
        </Button>
    )
}

const HistoryTable = ({points}) => {

    const timeFormat = (time) => {
        // geadapteerd van https://stackoverflow.com/a/35890537 ... datum toegevoegd en locale naar NL
        const dtFormat = new Intl.DateTimeFormat('nl-NL', {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: 'UTC'
        });

        return dtFormat.format(new Date(time / 1e6)); // 1e6 voor omzetten van nanoseconden naar milliseconden
    }

    if (points.length <= 0) {
        return(
            <tr>
                <td>Geen data</td>
                <td>Geen data</td>
            </tr>
        )
    } else {
        return (
            points.map(camera =>
                <tr>
                    <td>{timeFormat(camera.time)}</td>
                    <td>{camera.amount}</td>
                </tr>
            )
        )
    }
}

export default CameraHistoryView