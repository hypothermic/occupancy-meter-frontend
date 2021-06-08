import React, {useState, useEffect} from 'react'
import {Badge, Button, Col, Dropdown, Pagination, Row, Spinner, Table} from "react-bootstrap";
import {useHistory} from 'react-router-dom';
import {Wifi, WifiOff} from "react-bootstrap-icons";
import {LineChart, CartesianGrid, Line, XAxis, YAxis, ResponsiveContainer} from "recharts";

/*
 * Camera historie overzicht component
 * "match" is een parameter die door react-router wordt meegegeven
 */
const CameraHistoryView = ({match}) => {

    /*
     * Array met alle history points
     */
    const [points, setPoints] = useState([])

    /*
     * Status van de camera (online, offline)
     */
    const [status, setStatus] = useState(null)

    /*
     * Boolean of de pagina aan het laden is of niet
     */
    const [isLoading, setIsLoading] = useState(false)

    /*
     * Pagination: hoeveel punten per pagina
     */
    const [pointAmount, setPointAmount] = useState(10)

    /*
     * Pagination: huidige pagina
     */
    const [currentPage, setCurrentPage] = useState(0)

    /*
     * React-router history
     */
    const history = useHistory()

    /*
     * Functie die bij het laden van de pagina aangeroepen wordt.
     * Hij haalt de JSON data met de camera en history data van de REST endpoint op.
     */
    useEffect(() => load(), [])

    /*
     * Functie die de data opnieuw ophaalt wanneer de pagination page length aangepast is door de gebruiker
     */
    useEffect(() => load(), [pointAmount])

    /*
     * Functie die de data opnieuw ophaalt wanneer de huidige pagina is aangepast door de gebruiker
     */
    useEffect(() => load(), [currentPage])

    // Functie die de data ophaalt van de backend REST server
    const load = () => {
        setIsLoading(true);

        // Stuur een HTTP GET request naar de /history/:naam endpoint
        // Geef de parameters amount en offset mee voor pagination doelen
        fetch(`/history/` + match.params.id + `?amount=` + pointAmount + `&offset=` + (currentPage * pointAmount), {
            method: 'GET',
            headers: {
                // zorg er voor dat wij de data in JSON terug krijgen
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        })
        // Wanneer we de data terug hebben gekregen staat het in JSON formaat.
        // Unpack de JSON om er een JavaScript object van te maken
        .then(response => response.json())
        // Zet de status en points
        .then(message => {
            setStatus(message.status)
            setPoints(message.history)
            setIsLoading(false)
        })
        .catch(error => {
            console.log("Fout bij het ophalen van de data")
        })
    }

    // Functie die wordt aangeroepen wanneer er op de "terug" knop wordt gedrukt.
    const backFunction = () => history.push("/camera/list")

    /*
     * Als de REST call nog bezig is, laat een animatie zien.
     * In de JSX kunnen helaas geen comments worden gezet... we hebben het wel zo begrijpbaar mogelijk proberen te maken.
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
                    <Col xs={{span: 6}}>
                        <h2>History van camera "{match.params.id}"</h2>
                        &nbsp;
                        <CameraStateBadge cameraName={match.params.id} status={status} onStatusChange={load}/>
                    </Col>
                    <Col xs={{span: 2}}>
                        <RefreshButton refreshFunction={load} />
                    </Col>
                    <Col xs={{span: 2}}>
                        <DeleteButton cameraName={match.params.id} onCompleted={backFunction}/>
                    </Col>
                    <Col xs={{span: 2}}>
                        <BackButton backFunction={backFunction} />
                    </Col>
                </Row>

                <hr/>

                <HistoryGraph points={points}/>

                <Row className="mt-4 mb-2">
                    <Col>
                        <Dropdown className="w-100">
                            <Dropdown.Toggle className="w-100" variant="outline-primary" id="dropdown-basic">
                                {pointAmount} resultaten per pagina
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {[5,10,25,50,100,500].map((amount) => (
                                    <Dropdown.Item onClick={() => {setPointAmount(amount)}}>{amount}</Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col>
                        <Pagination className="w-100">
                            <Pagination.First/>
                            <Pagination.Prev/>

                            {range(currentPage-2, currentPage+2).map((page) => (
                                <Pagination.Item key={page} active={page === currentPage} onClick={() => {setCurrentPage(page)}}>
                                    {page + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next/>
                            <Pagination.Last/>
                        </Pagination>
                    </Col>
                    <Col xs={{span: 2}}>
                        <DeleteButton onClick={() => {} }/>
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

/*
 * Knop om de een camera uit de lijst te verwijderen.
 */
const DeleteButton = ({cameraName, onCompleted}) => {

    /*
     * Functie die een DELETE request stuurt om de camera te verwijderen
     */
    const send = () => {
        fetch(`/camera/` + cameraName, {
            method: 'DELETE',
        }).then(response => {
            onCompleted();

            switch (response.status) {
                // Aanmaken successvol
                case 201:
                    break;
                default:
                    console.log("Delete POST error " + response.status)
                    break;
            }
        })
    }

    return (
        <Button variant="primary" className="w-100" onClick={send}>
            Verwijderen
        </Button>
    )
}

/*
 * Knop om de data te herladen
 */
const RefreshButton = ({refreshFunction}) => {
    return (
        <Button variant="primary" className="w-100" onClick={refreshFunction}>
            Refresh
        </Button>
    )
}

/*
 * Knop om terug te gaan naar de CameraListView
 */
const BackButton = ({backFunction}) => {
    return (
        <Button variant="primary" className="w-100" onClick={backFunction}>
            Terug
        </Button>
    )
}

/*
 * Tabel waarin alle history punten staan
 */
const HistoryTable = ({points}) => {

    /*
     * Functie die een timestamp naar een string omzet
     */
    const timeFormat = (time) => {
        // geadapteerd van https://stackoverflow.com/a/35890537 ... datum toegevoegd en locale naar NL
        const dtFormat = new Intl.DateTimeFormat('nl-NL', {
            dateStyle: 'short',
            timeStyle: 'short',
        });

        return dtFormat.format(new Date(time)); // 1e6 voor omzetten van nanoseconden naar milliseconden
    }

    // Als er geen history punten zijn
    if (points.length <= 0) {
        return (
            <tr>
                <td colSpan={2} className="text-center py-5">Geen historie</td>
            </tr>
        )
    } else {
        // Zo wel, laat ze zien in rijen
        return (
            points.sort((a, b) => b.time - a.time).map(camera =>
                <tr>
                    <td>{timeFormat(camera.time)}</td>
                    <td>{camera.amount}</td>
                </tr>
            )
        )
    }
}

/*
 * Grafiek om de history te visualiseren
 * Met behulp van de recharts library
 */
const HistoryGraph = ({points}) => {
    return (
        <ResponsiveContainer width="100%" height={400}>

            <LineChart data={points} margin={{top: 5, right: 100, bottom: 20, left: 30}}>
                <Line type="monotone" dataKey="amount" stroke="#8884d8"/>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5"/>
                <XAxis name="Tijd" dataKey="time" type="number" domain={["auto", "auto"]} tick={<HistoryGraphTick/>}/>
                <YAxis name="Hoeveelheid Mensen" allowDecimals={false}/>
            </LineChart>

        </ResponsiveContainer>
    )
}

/*
 * Een label onder aan een grafiek punt
 */
const HistoryGraphTick = ({x, y, stroke, payload}) => {
    // geadapteerd van https://stackoverflow.com/a/35890537 ... datum toegevoegd en locale naar NL veranderd
    const dateFormatter = new Intl.DateTimeFormat('nl-NL', {
        dateStyle: 'short',
    });

    const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
        timeStyle: 'short',
    });

    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} fill="#666">
                <tspan textAnchor="middle" x="0">{dateFormatter.format(new Date(payload.value))}</tspan>
                <tspan textAnchor="middle" x="0" dy="20">{timeFormatter.format(new Date(payload.value ))}</tspan>
            </text>
        </g>
    )
}

/*
 * Status indicator van een camera
 */
const CameraStateBadge = ({cameraName, status, onStatusChange}) => {

    /*
     * Of de camera bezig is met verbinden (POST request is nog niet gereturned)
     */
    const [isConnecting, setIsConnecting] = useState(false);

    /*
     * Functie die een POST request stuurt om de camera te verbinden/disconnecten
     */
    const send = (action) => {
        setIsConnecting(true);

        // Stuur HTTP POST request naar /camera/:naam/status
        fetch(`/camera/` + cameraName + `/status`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                    "action": action,
                }
            ),
        // Wanneer de response is binnen gekomen:
        }).then(response => {
            setIsConnecting(false);

            // Check the HTTP status code van de response
            switch (response.status) {
                // Camerastatus veranderen is successvol
                case 204:
                    onStatusChange();
                    break;
                default:
                    console.log("Error in status change " + response.status)
                    break;
            }
        })
    }

    // Check of camera online/offline is
    switch (status) {
        case /* verbonden */ true:
            return (
                <Badge variant="success" onClick={() => send("disconnect")}>
                    <Wifi/>
                    &nbsp;
                    Verbonden
                </Badge>
            )
        default:
            // Check of camera aan het verbinden is
            if (isConnecting) {
                return (
                    <Badge variant="warning">
                        <WifiOff/>
                        &nbsp;
                        Verbinden...
                    </Badge>
                )
            } else /* offline */ {
                return (
                    <Badge variant="danger" onClick={() => send("connect")}>
                        <WifiOff/>
                        &nbsp;
                        Offline
                    </Badge>
                )
            }
    }
}

// Functie om alle getallen tussen "start" en "end" te krijgen
// https://stackoverflow.com/a/65050538/9107324, aangepast om geen negatieve getallen te genereren
const range = (start, end) => {
    if (start < 0) {
        start = 0;
    }

    return new Array(end - start + 1).fill().map((el, ind) => ind + start)
};

export default CameraHistoryView