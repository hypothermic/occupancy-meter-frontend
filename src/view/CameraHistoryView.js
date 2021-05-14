import React, {useState, useEffect} from 'react'
import {Badge, Button, Col, Dropdown, Pagination, Row, Spinner, Table} from "react-bootstrap";
import {useHistory} from 'react-router-dom';
import {Wifi, WifiOff} from "react-bootstrap-icons";
import {LineChart, CartesianGrid, Line, Tooltip, XAxis, YAxis, ResponsiveContainer} from "recharts";

const CameraHistoryView = ({match}) => {

    /*
     * Array met alle history pointss
     */
    const [points, setPoints] = useState([])

    /*
     * Status van de camera
     */
    const [status, setStatus] = useState(null)

    /*
     * Boolean of de pagina aan het laden is of niet
     */
    const [isLoading, setIsLoading] = useState(false)

    const [pointAmount, setPointAmount] = useState(10)
    const [currentPage, setCurrentPage] = useState(0)

    const history = useHistory()

    /*
     * Functie die bij het laden van de pagina aangeroepen wordt.
     * Hij haalt de JSON data met de camera en history data van de REST endpoint op.
     */
    useEffect(() => {
        load()
    }, [])

    useEffect(() => {
        load()
    }, [pointAmount])

    useEffect(() => {
        load()
    }, [currentPage])

    const load = () => {
        setIsLoading(true);

        fetch(`/history/` + match.params.id + `?amount=` + pointAmount + `&offset=` + (currentPage * pointAmount), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        })
        .then(response => response.json())
        .then(message => {
            setStatus(message.status)
            setPoints(message.history)
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
                        <h2>History van camera "{match.params.id}"</h2>
                        &nbsp;
                        <CameraStateBadge status={status}/>
                    </Col>
                    <Col xs={{span: 2}}>
                        <RefreshButton refreshFunction={load} />
                    </Col>
                    <Col xs={{span: 2}}>
                        <BackButton backFunction={() => history.push("/camera/list")} />
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
            dateStyle: 'short',
            timeStyle: 'short',
        });

        return dtFormat.format(new Date(time)); // 1e6 voor omzetten van nanoseconden naar milliseconden
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
            points.sort((a, b) => b.time - a.time).map(camera =>
                <tr>
                    <td>{timeFormat(camera.time)}</td>
                    <td>{camera.amount}</td>
                </tr>
            )
        )
    }
}

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

const HistoryGraphTick = ({x, y, stroke, payload}) => {
    // geadapteerd van https://stackoverflow.com/a/35890537 ... datum toegevoegd en locale naar NL
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

const CameraStateBadge = ({status}) => {
    switch (status) {
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

// https://stackoverflow.com/a/65050538/9107324, aangepast om geen negatieve getallen te genereren
const range = (start, end) => {
    if (start < 0) {
        start = 0;
    }

    return new Array(end - start + 1).fill().map((el, ind) => ind + start)
};

export default CameraHistoryView